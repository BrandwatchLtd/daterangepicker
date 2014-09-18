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

    var TIME_REGEX = /^([01]\d|2[0-3]):?([0-5]\d)$/;

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
        return $('<div class="time-support__panel"><input name="time" class="time-support__field" /></div>');
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

            if (time && !TIME_REGEX.test(time)) {
                panel.$input.addClass('invalid-time');
                return false;
            }

            return true;
        },

        getTime: function() {
            var time = this.$input.val() || '00:00';
            return moment(time, 'HH:mm');
        },

        setTime: function(time) {
            this.$input.val(time);
        },

        updateCalendarDate: function() {
            var panel = this,
                date,
                hours = 0,
                minutes = 0,
                time = panel.getTime();

            if (time) {
                hours = time.hours();
                minutes = time.minutes();
            }

            // clone the current selected date and update it's time
            date = moment(panel.calendar.selectedDate)
                .hours(hours)
                .minutes(minutes);

            panel.calendar.updateSelectedDate(date);
        },

        destroy: function() {
            var panel = this;

            if (panel.$el) {
                panel.$el.remove();
                panel.$el.off('.time-panel');
            }
        }
    });

    function TimeSupport() {
        var plugin = this;

        plugin.$el = getTimePanelWrapper();

        plugin.$specifyTime = plugin.$el.find('[name=specifyTime]');

        plugin.$specifyTime.on('change', function() {
            if ($(this).prop('checked')) {
                plugin.openPanel();
            } else {
                plugin.closePanel();
            }

            plugin.startPanel.updateCalendarDate();
            plugin.endPanel.updateCalendarDate();
        });
    }

    TimeSupport.pluginName = 'timeSupport';

    _.extend(TimeSupport.prototype, {
        render: function(daterangepicker) {
            var plugin = this;

            plugin.$el.insertBefore(daterangepicker.$el.find('.calendar-footer'));

            plugin.$panelWrapper = plugin.$el.find('.time-support__panel-wrapper');

            plugin.$panelWrapper
                .empty()
                .append(plugin.startPanel.$el);

            if (plugin.endPanel) {
                plugin.$panelWrapper.append(plugin.endPanel.$el);
            }
        },

        updatePanelTimes: function(args, options) {
            var plugin = this,
                startTime = args.startDate.format('HH:mm'),
                endTime = args.endDate.format('HH:mm');

            options = options || {};

            if (options.setStartTime) {
                plugin.startPanel.setTime(startTime);
            }

            if (options.setEndTime && plugin.endPanel) {
                plugin.endPanel.setTime(endTime);
            }
        },

        clearTime: function() {
            $('input[name="time"]').val('');
        },

        openPanel: function() {
            var plugin = this;

            plugin.$panelWrapper.addClass('isOpen');
            plugin.$panelWrapper.show();

            plugin.updatePanelTimes({
                startDate: moment().startOf('day'),
                endDate: moment().startOf('day')
            }, {
                setStartTime: true,
                setEndTime: true
            });
        },

        closePanel: function() {
            this.$panelWrapper.removeClass('isOpen');
            this.$panelWrapper.hide();
            this.clearTime();
        },

        attach: function(daterangepicker) {
            var plugin = this,
                startCalendar = daterangepicker.startCalendar,
                endCalendar = daterangepicker.endCalendar;

            plugin.startPanel = new TimePanel({
                calendar: startCalendar
            });

            if (endCalendar) {
                plugin.endPanel = new TimePanel({
                    calendar: endCalendar
                });
            }

            daterangepicker.bind('render', function() {
                plugin.render(daterangepicker);
            });

            daterangepicker.bind('startDateSelected', function(args) {
                plugin.updatePanelTimes(args, {
                    setEndTime: true
                });

                endCalendar.updateSelectedDate(args.endDate, {
                    silent: true
                });
            });

            daterangepicker.bind('endDateSelected', function(args) {
                plugin.updatePanelTimes(args, {
                    setStartTime: true
                });

                startCalendar.updateSelectedDate(args.startDate, {
                    silent: true
                });
            });

            daterangepicker.bind('presetSelected', function(args) {
                plugin.updatePanelTimes(args, {
                    setStartTime: true,
                    setEndTime: true
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