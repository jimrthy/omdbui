# omdbui
Quick javascript/ajax coding sample

This version does require a web server, because of XSS protection.
We can't reference the JSX file externally from the HTML.

For now, the work-around is to use something like

    python -m SimpleHTTPServer {port number}

The "real" answer is to figure out why my JSX compiler just silently
fails no matter what I try.

You'll also need to use compass to compile the foundation styling:

    compass compile .

Or

    compass watch .
for live updates.