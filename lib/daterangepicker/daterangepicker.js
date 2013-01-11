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
        define(['jquery', 'underscore', 'moment', 'mustache'], function($, _, moment, mustache){
            return factory($ || root.jQuery, _ || root._, moment || root.moment, mustache || root.mustache, MicroEvent);
        });
    }else{
        root.daterangepicker = factory(root.jQuery, root._, root.moment, root.Mustache, MicroEvent);
    }

})(this, function($, _, moment, mustache, MicroEvent){

    'use strict';

    if(!$){
        throw new Error('daterangepicker requires jQuery to be loaded');
    }
    if(!_){
        throw new Error('daterangepicker requires underscore to be loaded');
    }
    if(!mustache){
        throw new Error('daterangepicker requires mustache to be loaded');
    }

    function Calendar(options){
        var todayString = moment().format('YYYY-MM-DD');

        options = _.defaults(options, {
            selectedDate: todayString
        });

        var $el = this.$el = $('<div>'),
            className = options.className,
            selectedDate = moment(options.selectedDate),
            monthToDisplay = moment([selectedDate.year(), selectedDate.month()]);

        this.monthToDisplay = monthToDisplay;
        this.selectedDate = moment(selectedDate);

        if(className){
            $el.addClass(className);
        }

        $el.on('click', 'td.day', _.bind(this.onDayClicked, this));
        $el.on('click', 'th.next', _.bind(this.onNextClicked, this));
        $el.on('click', 'th.prev', _.bind(this.onPreviousClicked, this));
    }

    var calendarTemplate =
    '<table class="calendar">' +
    '<thead>' +
        '<tr>' +
            '<th class="prev"><span class="icon-arrow-left"></span></th>' +
            '<th class="month-title" colspan="5" style="width: auto">{{monthTitle}}</th>' +
            '<th class="next"><span class="icon-arrow-right"></span></th>' +
        '</tr>' +
        '<tr>' +
            '<th>Mon</th>' +
            '<th>Tue</th>' +
            '<th>Wed</th>' +
            '<th>Thu</th>' +
            '<th>Fri</th>' +
            '<th>Sat</th>' +
            '<th>Sun</th>' +
        '</tr>' +
    '</thead>' +
    '<tbody>' +
    '{{#rows}}' +
        '<tr class="week">' +
        '{{#columns}}' +
            '<td class="day {{className}}" data-date="{{date}}">{{dayNumber}}</td>' +
        '{{/columns}}' +
        '</tr>' +
    '{{/rows}}' +
    '</tbody>' +
    '</table>';

    _.extend(Calendar.prototype, {
        _getStartDate: function(){
            var startDate = this.monthToDisplay.clone();

            if(startDate.day() !== 1){
                startDate.subtract('days', startDate.day()-1);
            }

            return startDate;
        },

        _findCellByDate: function(date){
            return this.$el.find('.day[data-date="' + date.format('YYYY-MM-DD') + '"]');
        },

        render: function(){
            var rowStartDate = this._getStartDate().subtract('days', 1),
                selectedDate = this.selectedDate,
                monthToDisplayIndex = this.monthToDisplay.month(),
                getClassName = function(date){
                    var classes = [];

                    if(date.month() !== monthToDisplayIndex){
                        classes.push('grey');
                    } else if (date.toString() === selectedDate.toString()){
                        classes.push('selected');
                    }

                    if(classes.length){
                        return classes.join(' ');
                    }
                },
                weeksToShow = this._getStartDate().add('weeks', 6).month() > monthToDisplayIndex ? 5 : 6,
                data = {
                    monthTitle: this.monthToDisplay.format('MMMM YYYY'),
                    rows: _.map(_.range(weeksToShow), function(weekIdx){
                        return {
                            columns: _.map(_.range(7), function(dayIdx){
                                var date = rowStartDate.clone().add('days', (weekIdx * 7) + (dayIdx + 1) );

                                return {
                                    date: date.format('YYYY-MM-DD'),
                                    className: getClassName(date),
                                    dayNumber: date.date()
                                };
                            })
                        };
                    })
                };

            this.$el.html(mustache.to_html(calendarTemplate, data));
        },

        destroy: function(){
            var $el = this.$el;

            $el.off('click', 'td.day');
            $el.off('click', 'th.next');
            $el.off('click', 'th.prev');

            $el.remove();
        },

        onDayClicked: function(e){
            e.preventDefault();

            var target = $(e.target),
                date = target.data('date');

            this.updateSelectedDate(date);
        },

        updateSelectedDate: function(date){
            var newDate = this.selectedDate = moment(date),
                month = newDate.month(),
                year = newDate.year(),
                monthToDisplay = this.monthToDisplay;

            if(month !== monthToDisplay.month() || year !== monthToDisplay.year()){
                this.showMonth(year, month);
            }

            this.$el.find('.day.selected').removeClass('selected');
            this._findCellByDate(newDate).addClass('selected');

            this.trigger('onDateSelected', { date: date });
        },

        showMonth: function(year, month){
            console.log('showMonth', year, month);
            this.monthToDisplay = moment([year, month, 1]);
            this.render();

            this.trigger('onMonthDisplayed', { month: this.monthToDisplay });
        },

        highlightCells: function(startDate, endDate){
            var startCell = this._findCellByDate(startDate).not('.grey'),
                endCell = this._findCellByDate(endDate).not('.grey'),
                startRow = startCell.parent(),
                endRow = endCell.parent(),
                inRangeClassName = 'inRange',
                daySelector = '.day',
                greySelector = '.grey';

            this.$el.find('.'+inRangeClassName).removeClass(inRangeClassName);

            if(startDate.diff(endDate) === 0){
                return;
            }

            if(this.monthToDisplay.diff(startDate.clone().date(1)) < 0){
                return;
            }

            if(this.monthToDisplay.diff(endDate.clone().date(1)) > 0){
                return;
            }

            if(!startCell.length && !endCell.length){
                //fill all
                this.$el.find(daySelector).not(greySelector).addClass(inRangeClassName);
                return;
            }

            if(!startCell.length){
                //fill from start to endDate
                endCell.parent().prevAll().children(daySelector).not(greySelector).addClass(inRangeClassName);
                endCell.prevAll(daySelector).not(greySelector).addClass(inRangeClassName);
                return;
            }

            if(!endCell.length) {
                //fill from startDate to end
                startCell.parent().nextAll().children(daySelector).not(greySelector).addClass(inRangeClassName);
                startCell.nextAll(daySelector).not(greySelector).addClass(inRangeClassName);
                return;
            }

            //fill from startDate to endDate
            if(startRow.is(endRow)){
                startCell.nextUntil(endCell).addClass(inRangeClassName);
            } else {
                startRow.nextUntil(endRow).children(daySelector).not(greySelector).addClass(inRangeClassName);
                startCell.nextAll(daySelector).not(greySelector).addClass(inRangeClassName);
                endCell.prevAll(daySelector).not(greySelector).addClass(inRangeClassName);
            }

            endCell.addClass(inRangeClassName);
            startCell.addClass(inRangeClassName);
        },

        onNextClicked: function(e){
            e.preventDefault();

            var monthToShow = this.monthToDisplay.clone().add('months', 1);
            this.showMonth(monthToShow.year(), monthToShow.month());
        },

        onPreviousClicked: function(e){
            e.preventDefault();

            var monthToShow = this.monthToDisplay.subtract('months', 1);
            this.showMonth(monthToShow.year(), monthToShow.month());
        }
    });

    function DateRangePicker(options){
        var todayString = moment().format('YYYY-MM-DD');

        options = _.defaults(options, {
            startDate: todayString,
            endDate: todayString
        });

        this.$el = $('<div/>');
        this.startCalendar = this._createCalendar({
            selectedDate: options.startDate,
            className: 'startCalendar'
        });
        this.endCalendar = this._createCalendar({
            selectedDate: options.endDate,
            className: 'endCalendar'
        });

        this.startCalendar.bind('onDateSelected', _.bind(this.onStartDateSelected, this));
        this.startCalendar.bind('onMonthDisplayed', _.bind(this.updateStartCalendarHighlight, this));

        this.endCalendar.bind('onDateSelected', _.bind(this.onEndDateSelected, this));
        this.endCalendar.bind('onMonthDisplayed', _.bind(this.updateEndCalendarHighlight, this));
    }

    DateRangePicker.create = function(options){
        options = options || {};

        var className = options.className,
            picker;

        delete options.className;

        picker = new DateRangePicker(options);

        if(className){
            picker.$el.addClass(className);
        }

        return picker;
    };

    _.extend(DateRangePicker.prototype, {

        _createCalendar: function(month, year, selectedDate, className){
            return new Calendar(month, year, selectedDate, className);
        },

        render: function(){
            var startCalendar = this.startCalendar,
                endCalendar = this.endCalendar;

            startCalendar.render();
            endCalendar.render();

            this.$el.addClass('picker').append(startCalendar.$el).append(endCalendar.$el);
        },

        destroy: function(){
            this.startCalendar.destroy();
            this.endCalendar.destroy();

            this.$el.remove();
        },

        getStartDate: function(){
            return this.startCalendar.selectedDate;
        },

        getEndDate: function(){
            return this.endCalendar.selectedDate;
        },

        updateStartCalendarHighlight: function(){
            this.startCalendar.highlightCells(this.getStartDate(), this.getEndDate());
        },

        updateEndCalendarHighlight: function(){
            this.endCalendar.highlightCells(this.getStartDate(), this.getEndDate());
        },

        highlightRange: function(startDate, endDate){
            if(startDate.diff(endDate) > 0){
                return;
            }

            this.startCalendar.highlightCells(startDate, endDate);
            this.endCalendar.highlightCells(startDate, endDate);
        },

        onStartDateSelected: function(args){
            var startDate = moment(args.date),
                endDate = this.getEndDate();

            if(moment(startDate).diff(endDate) > 0){
                this.endCalendar.updateSelectedDate(startDate);
            }

            this.highlightRange(startDate, endDate);
        },

        onEndDateSelected: function(args){
            var endDate = moment(args.date),
                startDate = this.getStartDate();

            if(moment(startDate).diff(endDate) > 0){
                this.startCalendar.updateSelectedDate(endDate);
            }

            this.highlightRange(startDate, endDate);
        }

    });

    MicroEvent.mixin(Calendar);
    MicroEvent.mixin(DateRangePicker);

    $.fn.daterangepicker = function() {
        return this.each(function() {
            var $self = $(this);

            $self.on('click', function(){
                var picker = $self.data().picker;

                if(!picker){
                    picker = DateRangePicker.create();
                    picker.render();

                    $self.data('picker', picker);
                    $self.after(picker.$el);
                }
            });
        });
    };

    return DateRangePicker;
});