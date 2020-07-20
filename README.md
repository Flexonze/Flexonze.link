# Flexonze.link
## A url shortener that doesn't really shorten urls

### Register a new link
https://Flexonze.link/create/:password/:slug/:url

ˋ:passwordˋ is a secret to make sure only flexonze can use this view.
ˋslugˋ is the (unique) keyword
ˋurlˋ is the url to be "shortened"

__Note__: 
- Right now, slashes ('/') need to be escaped using ˋ%2Fˋ
- The url must not include "http://" or "https://"
Example: ˋgithub.com%2FFlexonzeˋ

__Example__: ˋhttps://Flexonze.link/create/password/github/github.com%2FFlexonzeˋ


### Use a link
Go to ˋhttps://Flexonze.link/:slugˋ
__Example__: https://Flexonze.link/github


#### Notes
This is a MVP, more functionnalities might be added in the future.
I acknowledge that the code is far from perfect since this has been made as a "one day project".
