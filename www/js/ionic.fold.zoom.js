(function(ionic) {

  /***********************************
   * Get transform origin poly
   ***********************************/
  var d = document.createElement('div');
  var transformKeys = ['webkitTransformOrigin', 'transform-origin', '-webkit-transform-origin', 'webkit-transform-origin',
              '-moz-transform-origin', 'moz-transform-origin', 'MozTransformOrigin', 'mozTransformOrigin'];

  var TRANSFORM_ORIGIN = 'webkitTransformOrigin';
  for(var i = 0; i < transformKeys.length; i++) {
    if(d.style[transformKeys[i]] !== undefined) {
      TRANSFORM_ORIGIN = transformKeys[i];
      break;
    }
  }

  var transitionKeys = ['webkitTransition', 'transition', '-webkit-transition', 'webkit-transition',
              '-moz-transition', 'moz-transition', 'MozTransition', 'mozTransition'];
  var TRANSITION = 'webkitTransition';
  for(var i = 0; i < transitionKeys.length; i++) {
    if(d.style[transitionKeys[i]] !== undefined) {
      TRANSITION = transitionKeys[i];
      break;
    }
  }

  /***********************************
   * Swipeable Card View
   ***********************************/
  var FoldZoomView = ionic.views.View.inherit({

    initialize: function(opts) {
      opts = ionic.extend({
      }, opts);

      ionic.extend(this, opts);

      this.el = opts.el;

      this.width = this.el.offsetWidth;
      this.height = this.el.offsetHeight;
      this.ratio = this.width / this.height;

      this.parentWidth = this.parent.offsetWidth;
      this.parentHeight = this.parent.offsetHeight;

      this.orientation = this.setOrientation();
      this.scale =  this.setScale(this.orientation);

      this.translateY = this.setTranslateY(this.orientation);
      this.translateX = this.setTranslateX(this.orientation);

    },

    /* Utils */

    setOrientation: function() {
      return ((this.parentHeight/this.parentWidth) > 1) ? 'portrait' : 'landscape';
    },

    setScale: function(orientation) {
      if(orientation === 'portrait') return (this.parentWidth - (this.padding * 2)) / this.width;
      if(orientation === 'landscape') return (this.parentHeight - (this.padding * 2)) / this.height;
    },

    setTranslateX: function(orientation) {
      if(orientation === 'portrait') return ((this.parentWidth / 2) - (this.width / 2)) - this.left;
      if(orientation === 'landscape') return ((this.parentWidth / 2) - (this.width / 2)) - this.left;
    },

    setTranslateY: function(orientation) {
      if(orientation === 'portrait') return (this.parentHeight / 2) - (this.height + this.top) + (this.height*this.scale / 2);
      if(orientation === 'landscape') return (this.parentHeight / 2) - (this.height + this.top) + (this.height*this.scale / 2);
    },

    setTransform: function(value) {
      var element = element || this.el;
      element.style.transform = element.style.webkitTransform = value;
    },

    setTransformOrigin: function(value) {
      var element = element || this.el;
      element.style.transformOrigin = element.style.webkitTransformOrigin = value;
    },

    setPerspectiveOrigin: function(value) {
      var element = element || this.el;
      element.parentNode.style.perspectiveOrigin = element.parentNode.style.webkitPerspectiveOrigin = value;
    },

    setZindex: function(value, element) {
      var element = element || this.el;
      element.style.zIndex = element.style.webkitzIndex = value;
    },

    isInTopSphere: function() {
      return this.top < (this.parentHeight / 2);
    },

    isInLeftSphere: function() {
      return this.left < (this.parentWidth / 2);
    },

    getPerspectiveOrigin: function() {
      if(this.isInTopSphere()) {
        return (this.isInLeftSphere()) ? 'top left' : 'top right';
      } else {
        return (this.isInLeftSphere()) ? 'bottom left' : 'bottom right';
      }
    },


    /* Animations */

    animateOpenStepOne: function() {
      var self = this;

      var card = this.el;

      var animation = collide.animation({
        duration: 400,
        percent: 0,
        reverse: false
      })

      .easing({
        type: 'spring',
        frequency: 5,
        friction: 100,
        initialForce: false
      })

      .on('start', function() {
        self.setZindex('11');

        var origin = self.getPerspectiveOrigin();
        self.setPerspectiveOrigin(origin);
      })
      .on('step', function(v) {
        self.setTransformOrigin('bottom');
        self.setTransform('rotateX(' + self.skew*v + 'deg)');
      })
      .on('complete', function(v){
        self.animateOpenStepTwo();
      })
      .start();

    },

    animateOpenStepTwo: function() {
      var self = this;

      var card = this.el;

      var animation = collide.animation({
        duration: 300,
        percent: 0,
        reverse: false
      })

      .easing({
        type: 'spring',
        frequency: 5,
        friction: 200,
        initialForce: false
      })

      .on('step', function(v) {
        self.setTransform('translate3d(' + self.translateX*v +'px,' + self.translateY*v +'px,0) scale(' + (1 + (self.scale-1)*v) + ') rotateX(' + (self.skew - self.skew*v) +'deg)');
      })
      .start();
    },

    animateCloseStepOne: function() {
      var self = this;

      var card = this.el;

      var animation = collide.animation({
        duration: 300,
        percent: 0,
        reverse: false
      })

      .easing({
        type: 'spring',
        frequency: 5,
        friction: 200,
        initialForce: false
      })

      .on('step', function(v) {
        self.setTransform('translate3d(' + self.translateX +'px,' + self.translateY +'px,0) scale(' + (1 + (self.scale-1)) + ') rotateX(' + -self.skew*v + 'deg)');
      })
      .on('complete', function(v){
        self.setZindex('10');
        self.animateCloseStepTwo();
      })
      .start();
    },

    animateCloseStepTwo: function() {
      var self = this;

      var card = this.el;

      var animation = collide.animation({
        duration: 300,
        percent: 0,
        reverse: false
      })

      .easing({
        type: 'spring',
        frequency: 5,
        friction: 300,
        initialForce: true
      })

      .on('step', function(v) {
        self.setTransform('translate3d(' + (self.translateX - self.translateX*v) +'px,' + (self.translateY - self.translateY*v) +'px,0) scale(' + ((1 + self.scale) - (1 + (self.scale-1)*v)) + ') rotateX(' + (self.skew - self.skew*v) +'deg)');
      })
      .on('complete', function(v){
        self.setZindex('1');
      })
      .start();
    },

  });

  /***********************************
   * Directive
   ***********************************/
    angular.module('ionic.fold.zoom', [])

      .directive('foldZoom', ['$rootScope', '$timeout', '$ionicPosition', function($rootScope, $timeout, $ionicPosition) {

        return {
          restrict: 'A',
          scope: {
            skew: "@",
            padding: "@"
          },
          link: function(scope, element, attr) {

            $timeout(function() {

              var position = $ionicPosition.position(element);

              var pane = document.getElementsByClassName('pane');

              console.log(pane)

              var foldZoomView = new FoldZoomView({
                el: element[0],
                parent: pane[0],
                skew: scope.skew,
                padding: scope.padding,
                top: position.top,
                left: position.left,
                ionicPosition: $ionicPosition,
                status: 'closed'
              });

              foldZoomView.el.parentNode.style.perspectiveOrigin = foldZoomView.el.parentNode.style.webkitPerspectiveOrigin = 'bottom right';
              foldZoomView.el.parentNode.style.perspective = foldZoomView.el.parentNode.style.webkitPerspective = '500px';

              foldZoomView.el.addEventListener('click', function(e){
                if(foldZoomView.status === 'closed'){
                  foldZoomView.status = 'open';
                  foldZoomView.animateOpenStepOne();
                } else {
                  foldZoomView.status = 'closed';
                  foldZoomView.animateCloseStepOne();
                }
              });

            })

          }
        }

      }]);

})(window.ionic);