const sessionStats = {};

function isValidURL(passedInString) {
  let normalizedString = passedInString;

  if (
    !normalizedString.startsWith("http://") &&
    !normalizedString.startsWith("https://")
  )
    normalizedString = "https://" + normalizedString;
  try {
    const parsedURL = new URL(normalizedString);

    if (
      !parsedURL.hostname.includes(".") &&
      parsedURL.hostname !== "localhost"
    ) {
      return false;
    }

    return parsedURL;
  } catch (error) {
    return false;
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function dataFetching(passedInURL) {
  const stats = sessionStats[passedInURL.href];

  try {
    const startTime = performance.now();

    let response = await fetch(passedInURL);

    const endTime = performance.now();
    const latency = Math.round(endTime - startTime);

    const status = response.status;
    const ok = response.ok;

    stats.totalLatency += latency;
    stats.totalPings++;
    stats.maxLatency = Math.max(stats.maxLatency, latency);
    stats.minLatency = Math.min(stats.minLatency, latency);

    if (ok) {
      stats.successfulPings += 1;
      console.log(
        `\x1b[32m[ONLINE]\x1b[0m ${passedInURL} | Status: ${status} | Latency: ${latency}ms`,
      );
    } else {
      stats.failedPings += 1;
      console.log(
        `\x1b[33m[DEGRADED]\x1b[0m ${passedInURL} | Status: ${status} | Latency: ${latency}ms`,
      );
    }
  } catch (error) {
    stats.totalPings++;
    stats.failedPings++;
    console.log(
      `\x1b[31m[OFFLINE]\x1b[0m ${passedInURL} | Error: ${error.message}`,
    );
  }
}

async function monitor(url, interval) {
  while (true) {
    await dataFetching(url);

    await sleep(interval);

    console.log("\n");
  }
}

let userInput;
const targetURLs = [];

function main() {
  let invalid = false;

  userInput.forEach((targetURL) => {
    const validatedURL = isValidURL(targetURL);

    if (validatedURL == false) {
      console.log("Error: Invalid URL \'" + targetURL + "\'");
      invalid = true;
      return;
    } else {
      sessionStats[validatedURL.href] = {
        totalPings: 0,
        successfulPings: 0,
        failedPings: 0,
        maxLatency: 0,
        minLatency: 0,
        totalLatency: 0,
      };

      targetURLs.push(validatedURL);
    }
  });

  if (invalid) return;

  let checkInterval = 1000;
  console.log("Fetching status every " + checkInterval + "ms for each URL\n");
  console.log("Target: ", targetURLs);

  targetURLs.forEach((targetURL) => {
    monitor(targetURL);
  });
}

function readUserInput() {
  userInput = process.argv.slice(2);

  if (userInput.length === 0) {
    console.log("Do: node monitor.js <URL 1> <URL 2> ...");
    return;
  }

  main();
}

readUserInput();

process.on("SIGINT", () => {
  console.log(
    "\n\n\x1b[36m[SYSTEM]\x1b[0m Monitor stopping. Calculating session summary...\n",
  );

  const finalSummary = {};

  Object.entries(sessionStats).forEach(([url, stats]) => {
    const avgLatency =
      stats.successfulPings > 0
        ? Math.round(stats.totalLatency / stats.successfulPings)
        : 0;

    finalSummary[url] = {
      "Total pings": stats.totalPings,
      "Successful Pings": stats.successfulPings,
      "Failed Pings": stats.failedPings,
      "Average Latency(ms)": avgLatency,
      "Max Latency (ms)": stats.maxLatency,
      "Min Latency (ms)": stats.minLatency,
    };
  });

  console.table(finalSummary);

  process.exit(0);
});
