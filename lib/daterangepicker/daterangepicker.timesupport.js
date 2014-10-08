(function(root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'underscore', 'moment', 'timepicker'], function($, _, moment) {
            return factory($, _, moment);
        });
    } else {
        root.daterangepicker.timeSupport = factory(root.jQuery, root._, root.moment);
    }
})(this, function($, _, moment) {
    'use strict';

    var TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/,
        TIME_FORMAT = 'HH:mm';

    function isValidTime(time) {
        return TIME_REGEX.exec(time);
    }

    function setupTimePanelEvents(panel) {
        panel.$el.on('change.time-panel', panel.$input, function() {
            if (panel.isValidTime()) {
                panel.updateCalendarDate();
            }
        });
    }

    function getTimePanel() {
        return $('<div class="time-support__panel"><input name="time" class="time-support__field field rounded" /></div>');
    }

    function getTimePanelWrapper() {
        var html = '<div class="time-support">' +
            '<div class="time-support__panel-wrapper" style="display:none;"></div>' +
            '<label class="time-support__specify-time"><input type="checkbox" name="specifyTime"> Specify time</label>' +
            '</div>';
        return $(html);
    }

    function TimePanel(options) {
        if (!options.calendar) {
            throw new Error('Time panel must be instantiated with options.calendar');
        }

        this.$el = getTimePanel();
        this.$input = this.$el.find('input[name="time"]').timepicker();
        this.calendar = options.calendar;

        setupTimePanelEvents(this);
    }

    _.extend(TimePanel.prototype, {
        isValidTime: function() {
            var panel = this,
                time = panel.$input.val();

            panel.$input.removeClass('invalid-time');

            if (!time || !TIME_REGEX.test(time)) {
                panel.$input.addClass('invalid-time');
                return false;
            }

            return true;
        },

        getTime: function() {
            var time = this.$input.val();
            return moment.utc(time, TIME_FORMAT);
        },

        setTime: function(time) {
            this.$input.val(time);
        },

        updateCalendarDate: function(options) {
            var panel = this,
                date,
                hours = 0,
                minutes = 0,
                time = panel.getTime(),
                currentDate = panel.calendar.selectedDate;

            options = options || {};

            if (time) {
                hours = time.hours();
                minutes = time.minutes();
            }

            date = moment.utc([
                currentDate.year(),
                currentDate.month(),
                currentDate.date(),
                hours,
                minutes
            ]);

            panel.calendar.updateSelectedDate(date, options);
        },

        destroy: function() {
            var panel = this;

            if (panel.$el) {
                panel.$el.remove();
                panel.$el.off('.time-panel');
            }
        }
    });

    function TimeSupport(options) {
        var plugin = this,
            isSpecifyTimeChecked = (options || {}).specifyTimeChecked;

        plugin.$el = getTimePanelWrapper();

        plugin.$specifyTime = plugin.$el.find('[name=specifyTime]');

        plugin.$specifyTime.prop('checked', isSpecifyTimeChecked);

        plugin.$specifyTime.on('change', _.bind(plugin.setPanelState, plugin));
    }

    TimeSupport.pluginName = 'timeSupport';

    _.extend(TimeSupport.prototype, {
        resetCalendars: function(){
            var plugin = this;

            plugin.startPanel.updateCalendarDate({silent: true});
            plugin.endPanel.updateCalendarDate({silent: true});

            plugin.picker.trigger('refresh', {
                startDate: plugin.startPanel.calendar.selectedDate,
                endDate: plugin.endPanel.calendar.selectedDate
            });
        },

        setPanelState: function () {
            var plugin = this;

            if (plugin.$specifyTime.prop('checked')) {
                plugin.openPanel();
            } else {
                plugin.closePanel();
            }
        },

        render: function(daterangepicker) {
            var plugin = this;

            plugin.$el.insertBefore(daterangepicker.$el.find('.calendar-footer'));

            plugin.$panelWrapper = plugin.$el.find('.time-support__panel-wrapper').css('display', 'table');

            plugin.$panelWrapper.html(plugin.startPanel.$el);

            if (plugin.endPanel) {
                plugin.$panelWrapper.append(plugin.endPanel.$el);
            }

            plugin.setPanelState();
        },

        updateStartTime: function(time) {
            this.startPanel.setTime(time.format(TIME_FORMAT));
        },

        updateEndTime: function(time) {
            this.endPanel.setTime(time.format(TIME_FORMAT));
        },

        openPanel: function() {
            var plugin = this;

            plugin.$panelWrapper
                .show()
                .addClass('isOpen');

            plugin.updateStartTime(plugin.startPanel.calendar.selectedDate.utc());
            plugin.updateEndTime(plugin.endPanel.calendar.selectedDate.utc());
            plugin.resetCalendars();
        },

        closePanel: function() {
            var plugin = this,
                startOfDay = moment().startOf('day');

            plugin.$panelWrapper
                .hide()
                .removeClass('isOpen');

            plugin.updateStartTime(startOfDay);
            plugin.updateEndTime(startOfDay);
            plugin.resetCalendars();
        },

        attach: function(daterangepicker) {
            var plugin = this,
                startCalendar = daterangepicker.startCalendar,
                endCalendar = daterangepicker.endCalendar;

            plugin.picker = daterangepicker;

            plugin.startPanel = new TimePanel({
                calendar: startCalendar
            });

            $('<label class="time-support__from">From</label>').insertBefore(plugin.startPanel.$input);

            if (endCalendar) {
                plugin.endPanel = new TimePanel({
                    calendar: endCalendar
                });

                $('<label class="time-support__to">To</label>').insertBefore(plugin.endPanel.$input);
                $('<span class="time-support__zone">(UTC)</span>').insertAfter(plugin.endPanel.$input);
            }

            daterangepicker.bind('render', function() {
                plugin.render(daterangepicker);
            });

            daterangepicker.bind('startDateSelected', function(args) {
                plugin.updateEndTime(args.endDate);

                endCalendar.updateSelectedDate(args.endDate, {
                    silent: true
                });
            });

            daterangepicker.bind('endDateSelected', function(args) {
                plugin.updateStartTime(args.startDate);

                startCalendar.updateSelectedDate(args.startDate, {
                    silent: true
                });
            });


            daterangepicker.bind('presetSelected', function(args) {
                var specifyTime = (args.specifyTime === true) ? true : false;

                plugin.$specifyTime.prop('checked', specifyTime).trigger('change');

                plugin.updateStartTime(args.startDate);
                plugin.updateEndTime(args.endDate);

                startCalendar.updateSelectedDate(args.startDate, {
                    silent: true
                });

                endCalendar.updateSelectedDate(args.endDate, {
                    silent: true
                });
            });

            /* calendar.updateSelectedDate is called when a day table cell ('td.day')
             * is clicked and it passes date as a string e.g. "2014-09-12".
             * When that happens the current time entered by the user is lost.
             *
             * This wrapper function ensures that calendar.updateSelectedDate
             * is always called with both date and time if specify time is checked.
             */
            function updateSelectedDateWrapper(panel, originalUpdateSelectedDate, date, options) {
                var time;

                if (plugin.$specifyTime.prop('checked')) {
                    time = panel.getTime();
                    date = moment(date).hours(time.hours()).minutes(time.minutes());
                }

                originalUpdateSelectedDate.call(panel.calendar, date, options);
            }

            startCalendar.updateSelectedDate = _.wrap(startCalendar.updateSelectedDate, function(originalFunc, date, options) {
                updateSelectedDateWrapper(plugin.startPanel, originalFunc, date, options);
            });

            if (endCalendar) {
                endCalendar.updateSelectedDate = _.wrap(endCalendar.updateSelectedDate, function(originalFunc, date, options) {
                    updateSelectedDateWrapper(plugin.endPanel, originalFunc, date, options);
                });
            }
        },

        detach: function() {
            var plugin = this;

            plugin.$el.remove();

            plugin.startPanel.destroy();

            if (plugin.endPanel) {
                plugin.endPanel.destroy();
            }
        }
    });

    return TimeSupport;
});