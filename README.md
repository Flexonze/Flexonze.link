# Flexonze.link
A personnal url shortener that doesn't really shorten urls


## Register a new link
`https://Flexonze.link/create/:password/:slug/:url`

`:password` is a secret to make sure only flexonze can use this view.
`:slug` is the (unique) keyword
`:url` is the url to be "shortened"

Note: 
- The url must not include "http://" or "https://"

__Example__: `https://Flexonze.link/create/password/github/github.com/Flexonze`



## Use a link
Go to `https://Flexonze.link/:slug`

__Example__: https://Flexonze.link/github


## Notes
- This is a MVP, more functionnalities might be added in the future.
- I acknowledge that the code is far from perfect since this has been made as a "one day project".
