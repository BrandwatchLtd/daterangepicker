/*
 * daterangepicker.js, renders lightweight date rangepicker.
 *
 * Dependencies: jQuery, underscore.js
 *
 * License: MIT
**/
(function(root, factory){
    'use strict';

    // Full MicroEvents library @ 54e85c036c3f903b963a0e4a671f72c1089ae4d4
    // (added some missing semi-colons etc, that's it)
    /**
     * MicroEvent - to make any js object an event emitter (server or browser)
     *
     * - pure javascript - server compatible, browser compatible
     * - dont rely on the browser doms
     * - super simple - you get it immediatly, no mistery, no magic involved
     *
     * - create a MicroEventDebug with goodies to debug
     *   - make it safer to use
    */

    var MicroEvent  = function(){};
    MicroEvent.prototype    = {
        bind    : function(event, fct){
            this._events = this._events || {};
            this._events[event] = this._events[event]   || [];
            this._events[event].push(fct);
        },
        unbind  : function(event, fct){
            this._events = this._events || {};
            if( event in this._events === false  ) { return; }
            this._events[event].splice(this._events[event].indexOf(fct), 1);
        },
        trigger : function(event /* , args... */){
            this._events = this._events || {};
            if( event in this._events === false  ) { return; }
            for(var i = 0; i < this._events[event].length; i++){
                this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
            }
        }
    };

    /**
     * mixin will delegate all MicroEvent.js function in the destination object
     *
     * - require('MicroEvent').mixin(Foobar) will make Foobar able to use MicroEvent
     *
     * @param {Object} the object which will support MicroEvent
    */
    MicroEvent.mixin    = function(destObject){
        var props   = ['bind', 'unbind', 'trigger'];
        for(var i = 0; i < props.length; i ++){
            destObject.prototype[props[i]]  = MicroEvent.prototype[props[i]];
        }
    };
    /// END MicroEvents

    // Work with AMD or plain-ol script tag
    if(typeof define === 'function' && define.amd){
        // If window.jQuery or window._ are not defined, then assume we're using AMD modules
        define(['jquery', 'underscore', 'moment'], function($, _, moment){
            return factory($ || root.jQuery, _ || root._, moment || root.moment, MicroEvent);
        });
    }else{
        root.daterangepicker = factory(root.jQuery, root._, root.moment, MicroEvent);
    }

})(this, function($, _, moment, MicroEvent){

    'use strict';

    if(!$){
        throw new Error('daterangepicker requires jQuery to be loaded');
    }
    if(!_){
        throw new Error('daterangepicker requires underscore to be loaded');
    }

    function DateRangePicker(){
        this.$el = $('<div/>');
    }

    DateRangePicker.create = function(options){
        options = options || {};

        var className = options.className,
            picker = new DateRangePicker();

        if(className){
            picker.$el.addClass(className);
        }

        return picker;
    };

    _.extend(DateRangePicker.prototype, {

        createCalendar: function(month, year){
            var calendar = {},
                dates = calendar._dates = [],
                selectedMonth = moment([year, month]),
                startDate = selectedMonth.clone();

            while(startDate.day() !== 1){
                startDate = startDate.subtract('days', 1);
            }

            _.times(42, function(i){
                dates[i] = startDate.clone().add('days', i);
            });

            return calendar;
        },

        destroy: function(){
            //cleanup

            this.$el.remove();
        }

    });

    MicroEvent.mixin(DateRangePicker);

    return DateRangePicker;

});