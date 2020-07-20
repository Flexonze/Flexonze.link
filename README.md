# Flexonze.link
A url shortener that doesn't really shorten urls


## Register a new link
https://Flexonze.link/create/:password/:slug/:url

`:password` is a secret to make sure only flexonze can use this view.

`slug` is the (unique) keyword

`url` is the url to be "shortened"

Note: 
- Right now, slashes ('/') need to be escaped using `%2F`
- The url must not include "http://" or "https://"
Example: `github.com%2FFlexonze`

__Example__: `https://Flexonze.link/create/password/github/github.com%2FFlexonze`



## Use a link
Go to `https://Flexonze.link/:slug`

__Example__: https://Flexonze.link/github



#### Notes
- This is a MVP, more functionnalities might be added in the future.
- I acknowledge that the code is far from perfect since this has been made as a "one day project".
