define([
    'lib/daterangepicker/daterangepicker',
    'lib/daterangepicker/daterangepicker.timesupport'
], function(daterangepicker, timesupport) {
    'use strict';

    var DateRangePicker = daterangepicker.DateRangePicker;

    describe('time support plugin', function() {
        var picker;

        afterEach(function() {
            if (picker) {
                picker.destroy();
                picker = undefined;
            }
        });

        describe('when attached', function() {
            beforeEach(function() {
                picker = daterangepicker.create({
                    plugins: [timesupport]
                });

                picker.render();
            });

            it('renders a time support wrapper', function() {
                expect(picker.$el.find('.time-support').length).toEqual(1);
            });

            it('renders a checkbox to allow the use to specify a time', function() {
                expect(picker.$el.find('[name="specifyTime"]').length).toEqual(1);
            });

            it('renders two panels inside the wrapper', function() {
                expect(picker.$el.find('.time-support__panel-wrapper .time-support__panel').length).toEqual(2);
            });
        });

        describe('validation', function() {
            beforeEach(function() {
                picker = daterangepicker.create({
                    plugins: [timesupport]
                });

                picker.render();
            });

            describe('when the value is invalid', function() {
                var $input;

                beforeEach(function() {
                    $input = picker.$el.find('input[name="time"]').first();
                    $input.val('9999').trigger('change');
                });

                it('adds the class "invalid-time" on change', function() {
                    expect($input.hasClass('invalid-time')).toEqual(true);
                });
            });

            describe('when the value is valid', function() {
                var $input;

                beforeEach(function() {
                    $input = picker.$el.find('input[name="time"]').first();
                    $input.val('20:10').trigger('change');
                });

                it('removes the class "invalid-time" on change', function() {
                    expect($input.hasClass('invalid-time')).toEqual(false);
                });

                it('updates the calendar selected date', function() {
                    expect(picker.startCalendar.selectedDate.hours()).toEqual(20);
                    expect(picker.startCalendar.selectedDate.minutes()).toEqual(10);
                });
            });

            describe('when the field is emptied after an invalid entry', function() {
                var $input;

                beforeEach(function() {
                    $input = picker.$el.find('input[name="time"]').first();
                    $input.val('9999').trigger('change');
                    $input.val('').trigger('change');
                });

                it('removes the class "invalid-time" on change', function() {
                    expect($input.hasClass('invalid-time')).toEqual(false);
                });
            });
        });

        describe('highlighting cells', function() {
            var $startTime,
                $endTime;

            beforeEach(function() {
                picker = daterangepicker.create({
                    plugins: [timesupport]
                });

                picker.render();

                $startTime = picker.$el.find('input[name="time"]').first();
                $endTime = picker.$el.find('input[name="time"]').last();
            });

            describe('when a start time is entered and the dates are the same', function() {
                beforeEach(function() {
                    picker.startCalendar.$el.find('.day[data-date="2014-9-19"]').click();
                    picker.endCalendar.$el.find('.day[data-date="2014-9-19"]').click();

                    $startTime.val('12:00').trigger('change');
                    $endTime.val('').trigger('change');
                });

                it('correctly highlights the calendar cells', function() {
                    expect(picker.startCalendar.$el.find('.inRange').length).toEqual(0);
                });
            });

            describe('when an end time is entered and the dates are the same', function() {
                beforeEach(function() {
                    picker.startCalendar.$el.find('.day[data-date="2014-9-19"]').click();
                    picker.endCalendar.$el.find('.day[data-date="2014-9-19"]').click();

                    $startTime.val('').trigger('change');
                    $endTime.val('19:00').trigger('change');
                });

                it('correctly highlights the calendar cells', function() {
                    expect(picker.startCalendar.$el.find('.inRange').length).toEqual(0);
                });
            });

            describe('when a start and end times are entered and the dates are the same', function() {
                beforeEach(function() {
                    picker.startCalendar.$el.find('.day[data-date="2014-9-19"]').click();
                    picker.endCalendar.$el.find('.day[data-date="2014-9-19"]').click();

                    $startTime.val('12:20').trigger('change');
                    $endTime.val('19:00').trigger('change');
                });

                it('correctly highlights the calendar cells', function() {
                    expect(picker.startCalendar.$el.find('.inRange').length).toEqual(0);
                });
            });

            describe('when a start time is later than the end time', function() {
                beforeEach(function() {
                    picker.startCalendar.$el.find('.day[data-date="2014-9-19"]').click();
                    picker.endCalendar.$el.find('.day[data-date="2014-9-19"]').click();

                    $endTime.val('10:00').trigger('change');
                    $startTime.val('14:20').trigger('change');
                });

                it('changes the end time to match the start time', function() {
                    expect($endTime.val()).toEqual('14:20');
                });
            });

            describe('when an end time is earlier than the start time', function() {
                beforeEach(function() {
                    picker.startCalendar.$el.find('.day[data-date="2014-9-19"]').click();
                    picker.endCalendar.$el.find('.day[data-date="2014-9-19"]').click();

                    $startTime.val('14:20').trigger('change');
                    $endTime.val('10:00').trigger('change');
                });

                it('changes the start time to match the end time', function() {
                    expect($startTime.val()).toEqual('10:00');
                });
            });
        });

        describe('daterangepicker events', function() {
            var $startTime,
                $endTime;

            beforeEach(function() {
                picker = daterangepicker.create({
                    plugins: [timesupport],
                    presets: {
                        'last hour': {
                            startDate: moment([2014,9,1,10,0]).format('YYYY-MM-DDTHH:mm'),
                            endDate: moment([2014,9,1,11,0]).format('YYYY-MM-DDTHH:mm')
                        }
                    },
                });

                picker.render();

                sinon.spy(picker, 'trigger');

                $startTime = picker.$el.find('input[name="time"]').first();
                $endTime = picker.$el.find('input[name="time"]').last();
            });

            describe('when startDateSelected is triggered on the daterangepicker', function() {
                beforeEach(function() {
                    $startTime.val('12:00').trigger('change');
                    picker.startCalendar.$el.find('.day[data-date="2014-9-19"]').click();
                });

                it('updates the time fields to show the new date', function() {
                    expect($startTime.val()).toEqual('12:00');
                    expect($endTime.val()).toEqual('12:00');
                    expect(picker.trigger.calledWith('startDateSelected')).toEqual(true);
                });
            });

            describe('when endDateSelected is triggered on the daterangepicker', function() {
                beforeEach(function() {
                    $endTime.val('12:00').trigger('change');
                    picker.endCalendar.$el.find('.day[data-date="2014-9-19"]').click();
                });

                it('updates the time fields to show the new date', function() {
                    expect($startTime.val()).toEqual('00:00');
                    expect($endTime.val()).toEqual('12:00');
                    expect(picker.trigger.calledWith('endDateSelected')).toEqual(true);
                });
            });

            describe('when presetSelected is triggered on the daterangepicker', function() {
                beforeEach(function() {
                    picker.$el.find('.presets li').eq(0).click();
                });

                it('updates the time fields to show the new date', function() {
                    expect($startTime.val()).toEqual('10:00');
                    expect($endTime.val()).toEqual('11:00');
                    expect(picker.trigger.calledWith('presetSelected')).toEqual(true);
                });
            });
        });

        describe('when detached', function() {
            beforeEach(function() {
                picker = daterangepicker.create({
                    plugins: [timesupport]
                });

                picker.render();

                picker.timeSupport.detach(picker);
            });

            it('removes the time input fields', function() {
                expect(picker.$el.find('input[name="time"]').length).toEqual(0);
            });

            it('removes the time time panel', function() {
                expect(picker.$el.find('.time-panel-wrapper').length).toEqual(0);
            });
        });

        describe('as a jquery plugin', function(){
            var input,
                picker,
                christmas2012Str = moment([2012,11,25]).format('YYYY-MM-DD'),
                nye2012Str = moment([2012,11,31]).format('YYYY-MM-DD');

            beforeEach(function(){
                input = $('<input id="pickerInput"/>');
                $('#testArea').append(input);

                input.daterangepicker({
                    zIndex: 1234,
                    startDate: '2013-01-01',
                    endDate: '2013-02-14',
                    presets: {
                        'christmas 2012': {
                            startDate: christmas2012Str,
                            endDate: christmas2012Str
                        },
                        'new years eve 2012': {
                            startDate: nye2012Str,
                            endDate: nye2012Str
                        }
                    },
                    plugins: [timesupport]
                });

                picker = input.data('picker');

                input.trigger('click');
            });

            afterEach(function(){
                input.data('picker').destroy();
                $('#testArea').empty();
            });

            it('hides the panel wrapper by default', function() {
                expect(picker.$el.find('.time-support__panel-wrapper').is(':visible')).toEqual(false);
            });

            it('shows the specify time checkbox by default', function() {
                expect(picker.$el.find('.time-support__specify-time').is(':visible')).toEqual(true);
            });

            it('adds the class "isOpen" when the specify time checkbox is checked', function() {
                picker.$el.find('[name=specifyTime]').prop('checked', false).trigger('click');

                expect(picker.$el.find('.time-support__panel-wrapper').hasClass('isOpen')).toEqual(true);
            });

            it('removes the class "isOpen" when the specify time checkbox is unchecked', function() {
                picker.$el.find('[name=specifyTime]').prop('checked', true).trigger('click');

                expect(picker.$el.find('.time-support__panel-wrapper').hasClass('isOpen')).toEqual(false);
            });
        });
    });
});