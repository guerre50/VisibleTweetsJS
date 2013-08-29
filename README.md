VisibleTweetsJS
==============
  
  JS implementation of the Flash Twitter visualization
  by The Man in Blue (http://www.themaninblue.com/)
  original version available at: http://visibletweets.com/

###Dependencies:
  - jQuery (http://jquery.com/)
  - jQuery Color (https://github.com/jquery/jquery-color)
  - Lettering (http://letteringjs.com/)
  - MomentJS (http://momentjs.com/)
  - TwitterFetcher (http://jasonmayes.com/projects/twitterApi)

###Config parameters:  

  **twitterID**: 'YOUR TWITTER ID',     _// Your ID_   
  **fadeTime**: 800,                    _// Time in ms taken for the transitions_  
  **tagCloudTime**: 5000,               _// Time in ms that the tagCloud will be shown_  
  **tweetTime**: 5000,                  _// Time in ms that the Tweet will be shown_  
  **preprocessTweets**: 0,             _// Initial tweets preloaded to the tagCloud_  
  **maxFont**: 60,                      _// Max and min fontSize used to show the words in the tagCloud_  
  **minFont**: 30,<br>
  **fetchTime**: 30000,                 _// Period that we will use to fetch tweets_  
  **startTime**: undefined,             _// tweets that are older that this date will be ignored_  
  **tweets**: 200                       _// Tweets that will be loaded_  


###TO-DO:<br>
  - Better fontSize of words in tagCloud
  - Set tweet fontSize depending on screen size
  - Encapsulate view 
  - Parameterize config parameters to allow embedding
  - Fix TimeZone problem
  - Separate word logic into its own Model
