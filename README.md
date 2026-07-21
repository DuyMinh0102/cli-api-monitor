# Hi, this is my very first project as I learn and get familiar with APIs.

This is a simple, native JavaScript program.

How to run it:

```
node monitor.js <URL 1 <URL 2> ... <URL n>
```

monitor.js is simply the original program's name, change it to whatever you've changed it to.
For installing node, please refer to NodeJS's documentation to install it on your system.

What it does:

- Sends an HTTP _GET_ request to URLs given
- Calculates latency, count successful/failed pings
- On termination, print out a summary in table format.
