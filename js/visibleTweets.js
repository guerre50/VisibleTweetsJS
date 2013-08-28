/* 

  VisibleTweets.JS 0.0.1 
    by Victor Guerrero Corbi - (@dimpledlearner)
  
    JS implementation of the Flash Twitter visualization
    by The Man in Blue (http://www.themaninblue.com/)
    original version available at: http://visibletweets.com/

  Dependencies:
    - jQuery (http://jquery.com/)
    - jQuery Color (https://github.com/jquery/jquery-color)
    - Lettering (http://letteringjs.com/)
    - MomentJS (http://momentjs.com/)
    - TwitterFetcher (http://jasonmayes.com/projects/twitterApi)

  Config parameters:
    twitterID: '372417300017590272',  // Your ID, 
    fadeTime: 800,                    // Time in ms taken for the transitions
    tagCloudTime: 5000,               // Time in ms that the tagCloud will be shown
    tweetTime: 5000,                  // Time in ms that the Tweet will be shown
    preprocessTweets : 0,             // Initial tweets preloaded to the tagCloud
    maxFont: 60,                      // Max and min fontSize used to show the words in the tagCloud
    minFont: 30,
    fetchTime: 30000,                 // Period that we will use to fetch tweets
    startTime: undefined,             // tweets that are older that this date will be ignored
    tweets: 200                       // Tweets that will be loaded


  TO-DO:
    - Better fontSize of words in tagCloud
    - Set tweet fontSize depending on screen size
    - Encapsulate view 
    - Parameterize config parameters to allow embedding
    - Fix TimeZone problem 
*/

function VisibleTweetsJS(config) {
  var tweet,
      tagCloud,
      fetcher,
      body,
      maxFont = 70,
      minFont = 30;

  var fadeTime = 500,
      tweetTime = 5000,
      tagCloudTime = 5000,
      transitionToTagCloudTime = fadeTime*5,
      transitionFromTweet = fadeTime*2;

  //var colors = ["#3d3d3f", "#f9ba03", "#0e9fd6", "#af65a1", "#9cbc32"],// Mobile Life
  var colors = ["#f78934", "#2ce3c7", "#00cdb5"], // CentreDay
  //var colors = ["#95e004", "#93c1fa", "#b695d7", "#ffcc00", "#fead38", "#fc65bd"],
      colorIndex = 0;

  init(config);

  function fetch() {
    addTweet(fetcher.pop());
  }

  function _setConfig(config) {
    fadeTime = config.fadeTime || fadeTime;
    tweetTime = config.tweetTime || tweetTime;
    tagCloudTime = config.tagCloudTime || tagCloudTime;
    maxFont = config.maxFont || maxFont;
    minFont = config.minFont || minFont;


    transitionToTagCloudTime = fadeTime*5,
    transitionFromTweet = fadeTime*2;
  }

  function init(config) {
    // Parameter setting
    _setConfig(config);

    // Object initialization
    tagCloud = new TagCloud();
    fetcher = new TwitterFetcher({
      id: config.twitterID,
      ready: fetch,
      startTime: config.startTime,
      tweets : config.tweets,
      fetchTime: config.fetchTime
    });
    body = $(document.body);
  }

  function interpolate(min, max, value) {
    return min + (max - min)*value*value;
  }

  function animateBackground() {
    colorIndex = (colorIndex + 1)%colors.length;
    body.animate({
      backgroundColor: $.Color(colors[colorIndex])
    }, fadeTime*2);
  }

  function animateToTweet() {
    tweet.fadeIn();  
    tagCloud.fadeOut();
    animateBackground();

    // When animation is finished we call to go towards tagCloud
    setTimeout(function() {
      animateToTagCloud();
    }, transitionToTagCloudTime + tweetTime);
  }

  function animateToTagCloud() {
    // Animation of the tagCloud
    tagCloud.update();
    animateBackground();
    tweet.fadeOut();

    setTimeout(function() {
      tagCloud.fadeIn();
      setTimeout(function() {
        addTweet(fetcher.pop());
      }, tagCloudTime);
    }, transitionFromTweet);
  }

  function addTweet(_tweet) {
    tweet = new Tweet(_tweet);
    animateToTweet();
  }

  function TwitterFetcher(config) {
    var _tweets = [],
        _index = -1,
        _readyCallback = config.ready,
        _newerTweetsIndex = 0,
        _twitterID = config.id,
        _maxTweets = config.tweets || 500,
        _lastTweetTime = config.startTime,
        _fetchTimeout,
        _fetchPeriod = config.fetchTime || 30000;

    _init();

    function _init() {
      _fetch();
    }

    function _dateFormatter(date) {
      // Correct timeZone
      return moment(date).add('hours', 2);
    }

    function _processTweets(tweets) {
      var youngestTweet;

      // We add tweets just if they are newer
      for (var t in tweets) {
        var tweet = _tweetFormatter(tweets[t]),
            tweetDate = new Date(tweet.time);

        if (!_lastTweetTime || tweetDate > _lastTweetTime) {
          _tweets.push(tweet);
          _newerTweetsIndex++;
          if (!youngestTweet) {
            youngestTweet = tweetDate;
          }
        } else {
          break;
        }
      }

      if (youngestTweet) {
        _lastTweetTime = youngestTweet;
      }

      if (_readyCallback) { 
        _readyCallback();
        _readyCallback = null;
      }

      setTimeout(_fetch, _fetchPeriod);
    }

    function pop() {
      if (_index + 1 == _tweets.length) {
        _index = -1;
        _fetch();
      }
      return _tweets[++_index];
    }

    function _fetch() {
      clearTimeout(_fetchTimeout);
      twitterFetcher.fetch(_twitterID, '', _maxTweets, true, true, true, _dateFormatter, false, _processTweets, false);
    }

    function _tweetFormatter(tweet) {
      var components = $(tweet).select("img");

      return {
        message: components[1].innerText.substr(0, 140),
        img: $($(components[0]).children()[0]).children()[0],
        time: components[2].innerHTML
      };
    }

    return {
      pop: pop
    }
  }

  function Tweet(tweet) {
    var _tweet = tweet,
      $tweet = $("#tweet"),
      $tweetDiv = $("#tweet p"),
      $tweetUser = $("#tweetUser"),
      $tweetTime = $("#tweetTime"),
      $tweetDetails = $("#tweetDetails"),
      tweetWords;

    _init();

    function _init() {
      $tweetDiv.html(_tweet.message);
      $tweetUser.html(_tweet.img);
      $tweetTime.html(moment(_tweet.time).fromNow());

      $tweetDetails.fadeOut(0);
      tweetWords = $tweetDiv.lettering('words').children();
    }

    function fadeIn() {
      // TO-DO 100px is an absolute size which is unappropiate
      // try to find a better way dependant on the height
      $tweetDetails.css('top', $tweetDiv.height() + 100);

      // animation of the Tweet
      tweetWords
        .each(_storeOffset)
        .css('position', 'absolute')
        .each(_fadeInWord)
        .each(_addWordToTagCloud);

      $tweetDetails.delay(fadeTime*3).fadeIn(fadeTime);
    }

    function fadeOut() {
      tweetWords.each(_fadeOutWord);
      $tweetDetails.fadeOut(fadeTime);
    }

    function _fadeInWord() {
      var word = tagCloud.get(this.innerHTML),
          self = $(this);

      if (word) {
        // If word is in the tagCloud
        // - FadeOut that tagCloud word
        // - Translate word to position
        var offset = word.element.offset(),
            fontSize = 50;

        self.offset(offset)
          .css('font-size', word.element.css('font-size'));

        word.element.animate({
          opacity: 0
        }, fadeTime, function() {
          self.animate({
            left: self.data('left'),
            top: self.data('top'),
            fontSize: fontSize
          }, fadeTime);
        });
      } else {
        // If word is not in the tagCloud,
        // we wait until words arrive and then
        // we fadeIn
        self.css("left", self.data("left")).css("top", self.data("top"))
          .animate({
            opacity: 0
          }, 0).delay(fadeTime*3).animate({
            opacity: 1
          }, fadeTime);
      }
    }

    function _fadeOutWord() {
      var word = this.innerHTML,
        tagWord = tagCloud.get(word);

      if (tagWord) {
        var offset = tagWord.element.offset();

        $(this).animate({
          top: offset.top, 
          left: offset.left,
          'font-size': tagWord.element.css('font-size')
        }, fadeTime*2, "swing", function() {
          $(this).delay(fadeTime*2).fadeOut(fadeTime);
        });
      } else {
        $(this).animate({
          opacity: '0'
        }, fadeTime);
      }
    }


    function _cleanWord(word) {
      word = word.replace(/https?:\/\//, "");

      if (word.length > 15) {
        word = word.substr(0, 15) + "..." ;
      }

      return word;
    }

    function _storeOffset() {
      var offset = $(this).offset();
      this.innerHTML = _cleanWord(this.innerHTML);

      $(this).data("left", offset.left).data("top", offset.top);
    }

    function _addWordToTagCloud() {
      tagCloud.add(this.innerHTML);
    }

    return {
      fadeOut: fadeOut,
      fadeIn: fadeIn,
    }
  }

  function TagCloud() {
    var words = {},
      $tagCloud = $("#tagCloud"),
      $tagCloudDiv = $("#tagCloud p"),
      _fontSizeCoefficient = 1,
      _max = 1;

    function add(word) {
      // We discard words that are not long enough
      if (word.length > 3 && word.length < 30) {
        var tagWord = words[word];

        if (!tagWord) {
          words[word] = {count: 1};
        } else {
          _max = Math.max(_max, words[word].count++);
        }
      }
    }

    function get(word) {
      return words[word];
    }

    function update() {
      // We create the tagWord from words in the tagWord
      var tagWord = _getTagCloudString();

      // We split the words and draw them
      var tagWords = $tagCloudDiv.html(tagWord).lettering('words').children();
      _draw(tagWords);

      // We center the tagCloud
      _center();
    }

    function _getTagCloudString() {
      var tagWord = "";

      $.each(words, function(element) {
        tagWord += element + " ";
      });

      return tagWord;
    }

    function _draw(tagWords) {
      // TO-DO fix sizing in a nicer way
      var wrong = true;
      while(wrong) {
        tagWords.each(_drawWord);
        var tagCloudHeight = $tagCloud.height(),
            tagCloudDivHeight =  $tagCloudDiv.height();

        wrong = tagCloudDivHeight > tagCloudHeight;
        _fontSizeCoefficient = Math.min(1, tagCloudHeight/tagCloudDivHeight);
      }

      _fontSizeCoefficient = 1;
    }

    function _center() {
      var tagCloudHeight = $tagCloud.height(),
          tagCloudDivHeight =  $tagCloudDiv.height();

      $tagCloud.css('top', ((tagCloudHeight-tagCloudDivHeight)/2/tagCloudHeight*100) +"%");
    }

    function _drawWord() {
      var word = this.innerHTML,
        wordElement = words[word];

      if (!wordElement) {
        wordElement = { count: 1};
        words[word] = wordElement;
      }

      wordElement.element = $(this);
      $(this).css('font-size', interpolate(minFont, maxFont, wordElement.count/_max)*_fontSizeCoefficient);
    }

    function fadeOut() {
      _animateOpacity(0, fadeTime);
    }

    function fadeIn() {
      _animateOpacity(1, fadeTime);
    }

    function _animateOpacity(opacity, lapse) {
      // TO-DO blur effect comented to increase performnace
      //$tagCloud.toggleClass('blurred', opacity == 0);
      $tagCloud.stop().animate({
        opacity: 1 - opacity 
      }, 0).delay(lapse).animate({
        opacity: opacity
      }, lapse);
    }

    return {
      add: add,
      get: get,
      fadeIn: fadeIn,
      fadeOut: fadeOut,
      update: update
    }
  }
};