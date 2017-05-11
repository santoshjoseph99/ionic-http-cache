Http based cache.

Uses Ionic local storage.

Example usage:
call the `getCacheOrData` with the URL.
`getCacheOrData` takes a 2nd optional parameter: the expiry time in millisec

if you post data to that URL, then to invalidate the cache call: `expireData` with the URL.
