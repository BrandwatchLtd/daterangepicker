define(['lib/daterangepicker/daterangepicker'],
    function(daterangepicker){
    'use strict';

    var DateRangePicker = daterangepicker.DateRangePicker;

    describe('daterangepicker', function(){
        var picker,
            christmas2012Str = moment([2012,11,25]).format('YYYY-MM-DD'),
            nye2012Str = moment([2012,11,31]).format('YYYY-MM-DD'),
            sandbox = sinon.sandbox.create();


        afterEach(function(){
            if(picker){
                picker.destroy();
                picker = undefined;
            }
            sandbox.restore();
        });

        describe('a datepicker calendar', function(){
            var calendar;

            beforeEach(function(){
                picker = daterangepicker.create();
                calendar = picker._createCalendar({
                    selectedDate: '2012-12-25',
                    className: 'myCalendar'
                });
            });

            it('calculates the start date as the first monday', function(){
                var startDate = calendar._getStartDate();

                expect(startDate.year()).toEqual(2012);
                expect(startDate.month()).toEqual(10);
                expect(startDate.date()).toEqual(26);
                expect(startDate.day()).toEqual(1);
            });

            describe('initialization', function(){
                it('stores the selected date', function(){
                    expect(calendar.selectedDate.toString()).toEqual(moment([2012,11,25]).toString());
                });

                it('stores the selected month', function(){
                    expect(calendar.monthToDisplay).toEqual(moment([2012,11,1]));
                });

                it('sets this.$el to be an empty div', function(){
                    expect(calendar.$el).toBeDefined();
                    expect(calendar.$el.is('div')).toEqual(true);
                    expect(calendar.$el.children().length).toEqual(0);
                });

                it('sets the className of this.$el', function(){
                    expect(calendar.$el.hasClass('myCalendar')).toEqual(true);
                });
            });

            describe('rendering', function(){
                beforeEach(function(){
                    calendar.render();
                });

                it('renders the table with 6 "week" rows', function(){
                    expect(calendar.$el.find('tr.week').length).toEqual(6);
                });

                it('renders the table with 6 "week" rows for months with 30 days that start on a Sunday', function(){
                    calendar = picker._createCalendar({
                        selectedDate: '2013-09-30',
                    });
                    calendar.render();
                    expect(calendar.$el.find('tr.week').length).toEqual(6);
                });

                it('renders the table with 6 "week" rows for months with 31 days that start on a Saturday', function(){
                    calendar = picker._createCalendar({
                        selectedDate: '2011-10-31',
                    });
                    calendar.render();
                    expect(calendar.$el.find('tr.week').length).toEqual(6);
                });

                it('renders the table with 42 "day" cells', function(){
                    expect(calendar.$el.find('td.day').length).toEqual(42);
                });

                it('adds the date to the day cells as "data-date"', function(){
                    expect(calendar.$el.find('td.day').first().data('date')).toEqual('2012-11-26');
                });

                it('adds a class of "grey" to the days not in the current month', function(){
                    expect(calendar.$el.find('td.day.grey').length).toEqual(11);
                });

                it('adds a class of "selected" to the selected date', function(){
                    expect(calendar.$el.find('td.day.selected').length).toEqual(1);
                    expect(calendar.$el.find('td.day.selected').data('date')).toEqual('2012-12-25');
                });

                it('renders the month title', function(){
                    expect(calendar.$el.find('th.month-title').text()).toEqual('December 2012');
                });

                it('does not render the close button when no presets specified', function(){
                    picker.render();
                    expect(picker.$el.find('.close').length).toEqual(0);
                });

                it('renders the close button when presets specified', function(){
                    picker = daterangepicker.create({
                        presets: {
                            'christmas 2012': {
                                startDate: christmas2012Str
                            },
                            'new years eve 2012': {
                                startDate: nye2012Str
                            }
                        }
                    });
                    picker.render();
                    expect(picker.$el.find('.close').length).toEqual(1);
                });

                it('renders the close button with custom css class', function(){
                    picker = daterangepicker.create({
                        presets: {
                            'christmas 2012': {
                                startDate: christmas2012Str
                            },
                            'new years eve 2012': {
                                startDate: nye2012Str
                            }
                        },
                        closeButtonCssClass: 'testClass'
                    });
                    picker.render();
                    expect(picker.$el.find('.close .testClass').length).toEqual(1);
                });
            });

            describe('events', function(){
                beforeEach(function(){
                    calendar.render();
                });

                it('triggers an onDateSelected event with the date clicked when a day is clicked', function(done){
                    calendar.bind('onDateSelected', function(args){
                        expect(args).toBeDefined();
                        expect(args.date).toEqual('2012-12-25');

                        done();
                    });

                    calendar.$el.find('td.day.selected').click();
                });

                it('updates the month if the date clicked is not on this.monthToDisplay', function(){
                    var previousMonthDate = calendar.$el.find('.day[data-date="2012-11-30"]'),
                        showMonthSpy = sinon.spy(calendar, 'showMonth');

                    previousMonthDate.click();

                    expect(showMonthSpy.calledOnce).toEqual(true);
                    expect(showMonthSpy.args[0][0]).toEqual(2012);
                    expect(showMonthSpy.args[0][1]).toEqual(10);
                });

                it('updates this.selectedDate when a day is clicked', function(){
                    var newDate = calendar.$el.find('.day[data-date="2012-12-01"]');

                    newDate.click();

                    expect(calendar.selectedDate.year()).toEqual(2012);
                    expect(calendar.selectedDate.month()).toEqual(11);
                    expect(calendar.selectedDate.date()).toEqual(1);
                });

                it('updates this.monthToDisplay when next is clicked', function(){
                    calendar.$el.find('.next').click();

                    expect(calendar.monthToDisplay.month()).toEqual(0);
                    expect(calendar.monthToDisplay.year()).toEqual(2013);
                });

                it('re-renders when next is clicked', function(){
                    var renderStub = sinon.stub(calendar, 'render');

                    calendar.$el.find('.next').click();

                    expect(renderStub.calledOnce).toEqual(true);
                });

                it('updates this.monthToDisplay when previous is clicked', function(){
                    calendar.$el.find('.prev').click();

                    expect(calendar.monthToDisplay.month()).toEqual(10);
                    expect(calendar.monthToDisplay.year()).toEqual(2012);
                });

                it('re-renders when previous is clicked', function(){
                    var renderStub = sinon.stub(calendar, 'render');

                    calendar.$el.find('.prev').click();

                    expect(renderStub.calledOnce).toEqual(true);
                });

                it('closes the picker when clicking close button', function(){
                    var hideSpy;
                    picker = daterangepicker.create({
                        presets: {
                            'christmas 2012': {
                                startDate: christmas2012Str
                            },
                            'new years eve 2012': {
                                startDate: nye2012Str
                            }
                        }
                    });
                    picker.render();

                    hideSpy = sinon.spy(picker, 'hide');
                    picker.$el.find('.close a').click();

                    expect(hideSpy.calledOnce).toEqual(true);
                });
            });

            describe('showing a month', function(){
                beforeEach(function(){
                    calendar.render();
                });

                it('updates this.monthToDisplay', function(){
                    calendar.showMonth(2010,0);

                    expect(calendar.monthToDisplay).toEqual(moment([2010,0]));
                });

                it('re-renders', function(){
                    var renderSpy = sinon.spy(calendar, 'render');

                    calendar.showMonth(2010,0);

                    expect(renderSpy.calledOnce).toEqual(true);
                });
            });

            describe('highlighting cells', function(){
                beforeEach(function(){
                    calendar.render();
                });

                it('highlights from the start to the end of the month if the end date is next month', function(){
                    var startDate = moment([2012,11,30]),
                        endDate = moment([2013,0,2]);

                    calendar.highlightCells(startDate, endDate);

                    expect(calendar.$el.find('.inRange').length).toEqual(1);
                    expect(calendar.$el.find('.inRange').eq(0).data('date')).toEqual('2012-12-31');
                });

                it('highlights from the end date to the start of the month if the start date is previous month', function(){
                    var startDate = moment([2012,10,30]),
                        endDate = moment([2012,11,2]);

                    calendar.highlightCells(startDate, endDate);

                    expect(calendar.$el.find('.inRange').length).toEqual(1);
                    expect(calendar.$el.find('.inRange').eq(0).data('date')).toEqual('2012-12-01');
                });

                it('highlights the range if both start and end are in the displayed month', function(){
                    var startDate = moment([2012,11,24]),
                        endDate = moment([2012,11,30]);

                    calendar.highlightCells(startDate, endDate);

                    expect(calendar.$el.find('.inRange').length).toEqual(7);
                    expect(calendar.$el.find('.inRange').eq(0).data('date')).toEqual('2012-12-24');
                    expect(calendar.$el.find('.inRange').eq(1).data('date')).toEqual('2012-12-25');
                    expect(calendar.$el.find('.inRange').eq(2).data('date')).toEqual('2012-12-26');
                    expect(calendar.$el.find('.inRange').eq(3).data('date')).toEqual('2012-12-27');
                    expect(calendar.$el.find('.inRange').eq(4).data('date')).toEqual('2012-12-28');
                    expect(calendar.$el.find('.inRange').eq(5).data('date')).toEqual('2012-12-29');
                    expect(calendar.$el.find('.inRange').eq(6).data('date')).toEqual('2012-12-30');
                });
            });
        });

        describe('a DateRangePicker with single date', function(){

            describe('initialization', function(){

                describe('defaults', function(){
                    beforeEach(function(){
                        picker = daterangepicker.create({
                            singleDate: true
                        });
                    });

                    it('creates a calendar for the current month as this.startCalendar', function(){
                        var now = moment();

                        expect(picker.startCalendar).toBeDefined();
                        expect(picker.startCalendar.monthToDisplay.month()).toEqual(now.month());
                    });

                    it('uses the current date as the startCalendar\'s selectedDate', function(){
                        var now = moment();

                        expect(picker.startCalendar.selectedDate.year()).toEqual(now.year());
                        expect(picker.startCalendar.selectedDate.month()).toEqual(now.month());
                        expect(picker.startCalendar.selectedDate.date()).toEqual(now.date());
                    });
                });

                describe('custom date supplied in options', function(){
                    beforeEach(function(){
                        picker = daterangepicker.create({
                            startDate: '2013-01-01',
                            singleDate: true
                        });
                    });

                    it('creates a calendar for the specified month as this.startCalendar', function(){
                        expect(picker.startCalendar).toBeDefined();
                        expect(picker.startCalendar.monthToDisplay.month()).toEqual(0);
                    });

                    it('uses the specified date as the startCalendar\'s selectedDate', function(){
                        expect(picker.startCalendar.selectedDate.year()).toEqual(2013);
                        expect(picker.startCalendar.selectedDate.month()).toEqual(0);
                        expect(picker.startCalendar.selectedDate.date()).toEqual(1);
                    });
                });

                describe('date range presets supplied in options', function(){
                    it('stores the presets hash as this.presets', function(){
                        var presets = {
                            foo: {
                                startDate: '2013-01-01'
                            },
                            bar: {
                                startDate: '2014-01-01'
                            }
                        };

                        picker = daterangepicker.create({
                            presets: presets,
                            singleDate: true
                        });

                        expect(picker.presets).toEqual(presets);
                    });
                });
            });

            describe('rendering', function(){
                var startCalendarRenderSpy;

                beforeEach(function(){
                    picker = daterangepicker.create({
                        singleDate: true
                    });

                    startCalendarRenderSpy = sinon.spy(picker.startCalendar, 'render');

                    picker.render();
                });

                afterEach(function(){
                    startCalendarRenderSpy = undefined;
                });

                it('does not create an end calendar', function(){
                    expect(picker.endCalender).not.toBeDefined();
                });

                it('renders the startCalendar into this.$el', function(){
                    expect(startCalendarRenderSpy.calledOnce).toEqual(true);
                    expect(picker.$el.find(picker.startCalendar.$el).length).toEqual(1);
                });

                it('does not render the calendar label', function(){
                    expect(picker.startCalendar.$el.find('.calendar-label').length).toEqual(0);
                });
            });

            describe('events', function(){
                beforeEach(function(){
                    picker = daterangepicker.create({
                        startDate: '2012-12-25',
                        singleDate: true
                    });
                    picker.render();
                });

                it('calls this.highlightRange when the startCalendar raises an onDateSelected event', function(){
                    var highlightRangeSpy = sinon.spy(picker, '_highlightRange');

                    picker.startCalendar.trigger('onDateSelected', { date: '2012-12-01' });

                    expect(highlightRangeSpy.calledOnce).toEqual(true);
                    expect(highlightRangeSpy.args[0][0].toString()).toEqual(moment([2012,11,1]).toString());
                    expect(highlightRangeSpy.args[0][1].toString()).toEqual(picker.getEndDate().toString());
                });

                it('triggers a startDateSelected event when the startCalendar date changes', function(){
                    var spy = sinon.spy();

                    picker.bind('startDateSelected', spy);

                    picker.startCalendar.$el.find('.day[data-date="2012-12-01"]').click();

                    expect(spy.calledOnce).toEqual(true);
                    expect(spy.args[0][0].startDate.toString()).toEqual(moment([2012,11,1]).toString());
                });
            });

            describe('presets', function(){
                beforeEach(function(){
                    picker = daterangepicker.create({
                        presets: {
                            'christmas 2012': {
                                startDate: christmas2012Str
                            },
                            'new years eve 2012': {
                                startDate: nye2012Str
                            }
                        },
                        singleDate: true
                    });

                    picker.render();
                });

                it('renders the presets list', function(){
                    expect(picker.$el.find('.presets').length).toEqual(1);

                    expect(picker.$el.find('.presets li').eq(0).text()).toEqual('christmas 2012');
                    expect(picker.$el.find('.presets li').eq(0).data('startdate')).toEqual('2012-12-25');
                    expect(picker.$el.find('.presets li').eq(0).data('enddate')).toEqual('2012-12-25');

                    expect(picker.$el.find('.presets li').eq(1).text()).toEqual('new years eve 2012');
                    expect(picker.$el.find('.presets li').eq(1).data('startdate')).toEqual('2012-12-31');
                    expect(picker.$el.find('.presets li').eq(1).data('enddate')).toEqual('2012-12-31');
                });

                it('selects the corresponding date when a preset is clicked', function(){
                    var christmas2012 = moment([2012,11,25]);

                    picker.$el.find('.presets li').eq(0).click();

                    expect(picker.getStartDate().toString()).toEqual(christmas2012.toString());
                    expect(picker.getEndDate().toString()).toEqual(christmas2012.toString());
                });

                it('triggers a presetSelected event when a preset is chosen', function(){
                    var spy = sinon.spy(),
                        christmas2012 = moment([2012,11,25]);

                    picker.bind('presetSelected', spy);

                    picker.$el.find('.presets li').eq(0).click();

                    expect(spy.calledOnce).toEqual(true);
                    expect(spy.args[0][0].startDate.toString()).toEqual(christmas2012.toString());
                    expect(spy.args[0][0].endDate.toString()).toEqual(christmas2012.toString());
                });
            });
        });

        describe('a DateRangePicker', function(){

            describe('initialization', function(){

                describe('defaults', function(){
                    beforeEach(function(){
                        picker = daterangepicker.create();
                    });

                    it('creates a calendar for the current month as this.startCalendar', function(){
                        var now = moment();

                        expect(picker.startCalendar).toBeDefined();
                        expect(picker.startCalendar.monthToDisplay.month()).toEqual(now.month());
                    });

                    it('creates a calendar for the current month as this.endCalendar', function(){
                        var now = moment();

                        expect(picker.endCalendar).toBeDefined();
                        expect(picker.endCalendar.monthToDisplay.month()).toEqual(now.month());
                    });

                    it('uses the current date as the startCalendar\'s selectedDate', function(){
                        var now = moment();

                        expect(picker.startCalendar.selectedDate.year()).toEqual(now.year());
                        expect(picker.startCalendar.selectedDate.month()).toEqual(now.month());
                        expect(picker.startCalendar.selectedDate.date()).toEqual(now.date());
                    });

                    it('uses the current date as the endCalendar\'s selectedDate', function(){
                        var now = moment();

                        expect(picker.endCalendar.selectedDate.year()).toEqual(now.year());
                        expect(picker.endCalendar.selectedDate.month()).toEqual(now.month());
                        expect(picker.endCalendar.selectedDate.date()).toEqual(now.date());
                    });
                });

                describe('custom range supplied in options', function(){
                    beforeEach(function(){
                        picker = daterangepicker.create({
                            startDate: '2013-01-01',
                            endDate: '2013-02-14'
                        });
                    });

                    it('creates a calendar for the specified month as this.startCalendar', function(){
                        expect(picker.startCalendar).toBeDefined();
                        expect(picker.startCalendar.monthToDisplay.month()).toEqual(0);
                    });

                    it('creates a calendar for the specified month as this.endCalendar', function(){
                        expect(picker.endCalendar).toBeDefined();
                        expect(picker.endCalendar.monthToDisplay.month()).toEqual(1);
                    });

                    it('uses the specified date as the startCalendar\'s selectedDate', function(){
                        expect(picker.startCalendar.selectedDate.year()).toEqual(2013);
                        expect(picker.startCalendar.selectedDate.month()).toEqual(0);
                        expect(picker.startCalendar.selectedDate.date()).toEqual(1);
                    });

                    it('uses the specified date as the endCalendar\'s selectedDate', function(){
                        expect(picker.endCalendar.selectedDate.year()).toEqual(2013);
                        expect(picker.endCalendar.selectedDate.month()).toEqual(1);
                        expect(picker.endCalendar.selectedDate.date()).toEqual(14);
                    });
                });

                describe('date range presets supplied in options', function(){
                    it('stores the presets hash as this.presets', function(){
                        var presets = {
                            foo: {
                                startDate: '2013-01-01',
                                endDate: '2013-01-31'
                            },
                            bar: {
                                startDate: '2014-01-01',
                                endDate: '2014-01-31'
                            }
                        };

                        picker = daterangepicker.create({
                            presets: presets
                        });

                        expect(picker.presets).toEqual(presets);
                    });
                });
            });

            describe('rendering', function(){
                var startCalendarRenderSpy,
                    endCalendarRenderSpy;

                beforeEach(function(){
                    picker = daterangepicker.create({
                        doneButtonCssClass: 'customDoneButtonCss'
                    });

                    startCalendarRenderSpy = sinon.spy(picker.startCalendar, 'render');
                    endCalendarRenderSpy = sinon.spy(picker.endCalendar, 'render');

                    picker.render();
                });

                afterEach(function(){
                    startCalendarRenderSpy = undefined;
                    endCalendarRenderSpy = undefined;
                });

                it('renders the startCalendar into this.$el', function(){
                    expect(startCalendarRenderSpy.calledOnce).toEqual(true);
                    expect(picker.$el.find(picker.startCalendar.$el).length).toEqual(1);
                });

                it('renders the correct label for the startCalendar', function(){
                    expect(picker.startCalendar.$el.find('.calendar-label').length).toEqual(1);
                    expect(picker.startCalendar.$el.find('.calendar-label').text()).toEqual('From');
                });

                it('renders the endCalendar into this.$el', function(){
                    expect(endCalendarRenderSpy.calledOnce).toEqual(true);
                    expect(picker.$el.find(picker.endCalendar.$el).length).toEqual(1);
                });

                it('renders the correct label for the endCalendar', function(){
                    expect(picker.endCalendar.$el.find('.calendar-label').length).toEqual(1);
                    expect(picker.endCalendar.$el.find('.calendar-label').text()).toEqual('To');
                });

                it('renders the footer and done button', function(){
                    var $footer = picker.$el.find('.calendar-footer');
                    expect($footer.length).toEqual(1);
                    expect($footer.find('button.done').length).toEqual(1);
                    expect($footer.find('button.done').hasClass('customDoneButtonCss')).toEqual(true);
                });
            });

            describe('events', function(){
                beforeEach(function(){
                    picker = daterangepicker.create({
                        startDate: '2012-12-25',
                        endDate: '2012-12-31'
                    });
                    picker.render();
                });

                it('changes the this.endCalendar.selectedDate if a later date is clicked on this.startCalendar', function(){
                    picker.startCalendar.updateSelectedDate('2014-01-01');

                    expect(picker.endCalendar.selectedDate.toString()).toEqual(picker.startCalendar.selectedDate.toString());
                });

                it('changes the this.startCalendar.selectedDate if an earlier date is clicked on this.endCalendar', function(){
                    picker.endCalendar.updateSelectedDate('2011-01-01');

                    expect(picker.endCalendar.selectedDate.toString()).toEqual(picker.startCalendar.selectedDate.toString());
                });

                it('calls this.highlightRange when the startCalendar raises an onDateSelected event', function(){
                    var highlightRangeSpy = sinon.spy(picker, '_highlightRange');

                    picker.startCalendar.trigger('onDateSelected', { date: '2012-12-01' });

                    expect(highlightRangeSpy.calledOnce).toEqual(true);
                    expect(highlightRangeSpy.args[0][0].toString()).toEqual(moment([2012,11,1]).toString());
                    expect(highlightRangeSpy.args[0][1].toString()).toEqual(picker.getEndDate().toString());
                });

                it('calls this.highlightRange when the endCalendar raises an onDateSelected event', function(){
                    var highlightRangeSpy = sinon.spy(picker, '_highlightRange');

                    picker.endCalendar.trigger('onDateSelected', { date: '2012-12-30' });

                    expect(highlightRangeSpy.calledOnce).toEqual(true);
                    expect(highlightRangeSpy.args[0][0].toString()).toEqual(moment([2012,11,25]).toString());
                    expect(highlightRangeSpy.args[0][1].toString()).toEqual(moment([2012,11,30]).toString());
                });

                it('triggers a startDateSelected event when the startCalendar date changes', function(){
                    var spy = sinon.spy();

                    picker.bind('startDateSelected', spy);

                    picker.startCalendar.$el.find('.day[data-date="2012-12-01"]').click();

                    expect(spy.calledOnce).toEqual(true);
                    expect(spy.args[0][0].startDate.toString()).toEqual(moment([2012,11,1]).toString());
                });

                it('triggers a endDateSelected event when the endCalendar date changes', function(){
                    var spy = sinon.spy();

                    picker.bind('endDateSelected', spy);

                    picker.endCalendar.$el.find('.day[data-date="2012-12-30"]').click();

                    expect(spy.calledOnce).toEqual(true);
                    expect(spy.args[0][0].endDate.toString()).toEqual(moment([2012,11,30]).toString());
                });

                it('triggers endDateSelected with corrected date when end date before start date', function(){
                    var spy = sinon.spy();

                    picker.bind('endDateSelected', spy);

                    picker.endCalendar.$el.find('.day[data-date="2012-12-20"]').click();

                    expect(spy.calledOnce).toEqual(true);
                    expect(spy.args[0][0].startDate.toString()).toEqual(moment([2012,11,20]).toString());
                    expect(spy.args[0][0].endDate.toString()).toEqual(moment([2012,11,20]).toString());
                });

                it('triggers startDateSelected with corrected date when start date after end date', function(){
                    var spy = sinon.spy();

                    picker.endCalendar.$el.find('.day[data-date="2012-12-30"]').click();

                    picker.bind('startDateSelected', spy);

                    picker.startCalendar.$el.find('.day[data-date="2012-12-31"]').click();

                    expect(spy.calledOnce).toEqual(true);
                    expect(spy.args[0][0].startDate.toString()).toEqual(moment([2012,11,31]).toString());
                    expect(spy.args[0][0].endDate.toString()).toEqual(moment([2012,11,31]).toString());
                });

                it('does not trigger onDateSelected on the other calendar when fixing start date', function(){
                    var dateSelectedEventStub = sinon.stub();

                    picker.startCalendar.$el.find('.day[data-date="2012-12-31"]').click();

                    picker.startCalendar.bind('onDateSelected', dateSelectedEventStub);

                    picker.endCalendar.$el.find('.day[data-date="2012-12-30"]').click();

                    expect(dateSelectedEventStub.callCount).toEqual(0);
                });

                it('does not trigger onDateSelected on the other calendar when fixing end date', function(){
                    var dateSelectedEventStub = sinon.stub();

                    picker.endCalendar.$el.find('.day[data-date="2012-12-30"]').click();

                    picker.endCalendar.bind('onDateSelected', dateSelectedEventStub);

                    picker.startCalendar.$el.find('.day[data-date="2012-12-31"]').click();

                    expect(dateSelectedEventStub.callCount).toEqual(0);
                });

                it('hides picker when done button is clicked', function(){
                    var hideSpy = sinon.spy(picker, 'hide');
                    picker.$el.find('button.done').click();
                    expect(hideSpy.calledOnce).toEqual(true);
                });
            });

            describe('highlighting cells', function(){
                var startCalendarHighlightCellsSpy,
                    endCalendarHighlightCellsSpy;

                beforeEach(function(){
                    picker = daterangepicker.create({
                        startDate: '2012-12-01',
                        endDate: '2012-12-31'
                    });
                    picker.render();

                    startCalendarHighlightCellsSpy = sinon.spy(picker.startCalendar, 'highlightCells');
                    endCalendarHighlightCellsSpy = sinon.spy(picker.endCalendar, 'highlightCells');
                });

                it('calls this.startCalendar.highlightCells with the correct dates', function(){
                    var startDate = moment([2012,11,1]),
                        endDate = moment([2012,11,31]);

                    picker._highlightRange(startDate, endDate);

                    expect(startCalendarHighlightCellsSpy.calledOnce).toEqual(true);
                    expect(startCalendarHighlightCellsSpy.args[0][0]).toEqual(startDate);
                    expect(startCalendarHighlightCellsSpy.args[0][1]).toEqual(endDate);
                });

                it('calls this.endCalendar.highlightCells with the correct dates', function(){
                    var startDate = moment([2012,11,1]),
                        endDate = moment([2012,11,31]);

                    picker._highlightRange(startDate, endDate);

                    expect(endCalendarHighlightCellsSpy.calledOnce).toEqual(true);
                    expect(endCalendarHighlightCellsSpy.args[0][0]).toEqual(startDate);
                    expect(endCalendarHighlightCellsSpy.args[0][1]).toEqual(endDate);
                });

                it('does not call either calendar\'s highlight cells method if an invalid date range is used', function(){
                    var startDate = moment([2012,11,31]),
                        endDate = moment([2012,11,1]);

                    picker._highlightRange(startDate, endDate);

                    expect(startCalendarHighlightCellsSpy.called).toEqual(false);
                    expect(endCalendarHighlightCellsSpy.called).toEqual(false);
                });
            });

            describe('presets', function(){
                beforeEach(function(){
                    var christmas2012Str = moment([2012,11,25]).format('YYYY-MM-DD'),
                        nye2012Str = moment([2012,11,31]).format('YYYY-MM-DD');

                    picker = daterangepicker.create({
                        presets: {
                            'christmas 2012': {
                                startDate: christmas2012Str,
                                endDate: christmas2012Str
                            },
                            'new years eve 2012': {
                                startDate: nye2012Str,
                                endDate: nye2012Str
                            }
                        }
                    });

                    picker.render();
                });

                it('renders the presets list', function(){
                    expect(picker.$el.find('.presets').length).toEqual(1);

                    expect(picker.$el.find('.presets li').eq(0).text()).toEqual('christmas 2012');
                    expect(picker.$el.find('.presets li').eq(0).data('startdate')).toEqual('2012-12-25');
                    expect(picker.$el.find('.presets li').eq(0).data('enddate')).toEqual('2012-12-25');

                    expect(picker.$el.find('.presets li').eq(1).text()).toEqual('new years eve 2012');
                    expect(picker.$el.find('.presets li').eq(1).data('startdate')).toEqual('2012-12-31');
                    expect(picker.$el.find('.presets li').eq(1).data('enddate')).toEqual('2012-12-31');
                });

                it('selects the corresponding date range when a preset is clicked', function(){
                    var christmas2012 = moment([2012,11,25]);

                    picker.$el.find('.presets li').eq(0).click();

                    expect(picker.getStartDate().toString()).toEqual(christmas2012.toString());
                    expect(picker.getEndDate().toString()).toEqual(christmas2012.toString());
                });

                it('triggers a presetSelected event when a preset is chosen', function(){
                    var spy = sinon.spy(),
                        christmas2012 = moment([2012,11,25]);

                    picker.bind('presetSelected', spy);

                    picker.$el.find('.presets li').eq(0).click();

                    expect(spy.calledOnce).toEqual(true);
                    expect(spy.args[0][0].startDate.toString()).toEqual(christmas2012.toString());
                    expect(spy.args[0][0].endDate.toString()).toEqual(christmas2012.toString());
                });
            });
        });

        describe('with time picker', function() {
            beforeEach(function() {
                picker = daterangepicker.create({
                    timePicker: true,
                    startDate: '2014-01-01',
                    endDate: '2014-01-01'
                });

                picker.render();
            });

            it('creates a time picker for each calendar', function() {
                var startPicker = picker.startCalendar.timePicker.$el.get(0),
                    endPicker = picker.endCalendar.timePicker.$el.get(0);
                expect(startPicker === endPicker).toEqual(false);
            });

            it('renders a time picker field for each calendar', function() {
                expect(picker.startCalendar.$el.find('.time-picker-row').length).toEqual(1);
                expect(picker.startCalendar._getTimeField().length).toEqual(1);

                expect(picker.endCalendar.$el.find('.time-picker-row').length).toEqual(1);
                expect(picker.endCalendar.$el.find('input[name="time"]').length).toEqual(1);
            });

            it('renders the correct time picker label for each time picker', function() {
                expect(picker.startCalendar.$el.find('.calendar-time-picker-label').text()).toEqual('at');
                expect(picker.endCalendar.$el.find('.calendar-time-picker-label').text()).toEqual('at');
            });

            it('sets the time picker fields to "--:--" by default', function() {
                expect(picker.startCalendar._getTimeField().val()).toEqual('--:--');
                expect(picker.endCalendar.$el.find('input[name="time"]').val()).toEqual('--:--');
            });

            it('sets the time picker fields to "--:--" if just a date is selected', function() {
                picker.startCalendar.$el.find('.day').first().click();
                picker.endCalendar.$el.find('.day').first().click();

                expect(picker.startCalendar._getTimeField().val()).toEqual('--:--');
                expect(picker.endCalendar.$el.find('input[name="time"]').val()).toEqual('--:--');
            });

            describe('time picker html', function() {
                it('should return a list of times separated by 30 minutes', function() {
                    var lis = [
                        '<li data-time="--:--">--:--</li>',
                        '<li data-time="00:30">00:30</li>',
                        '<li data-time="01:00">01:00</li>',
                        '<li data-time="01:30">01:30</li>',
                        '<li data-time="02:00">02:00</li>',
                        '<li data-time="02:30">02:30</li>',
                        '<li data-time="03:00">03:00</li>',
                        '<li data-time="03:30">03:30</li>',
                        '<li data-time="04:00">04:00</li>',
                        '<li data-time="04:30">04:30</li>',
                        '<li data-time="05:00">05:00</li>',
                        '<li data-time="05:30">05:30</li>',
                        '<li data-time="06:00">06:00</li>',
                        '<li data-time="06:30">06:30</li>',
                        '<li data-time="07:00">07:00</li>',
                        '<li data-time="07:30">07:30</li>',
                        '<li data-time="08:00">08:00</li>',
                        '<li data-time="08:30">08:30</li>',
                        '<li data-time="09:00">09:00</li>',
                        '<li data-time="09:30">09:30</li>',
                        '<li data-time="10:00">10:00</li>',
                        '<li data-time="10:30">10:30</li>',
                        '<li data-time="11:00">11:00</li>',
                        '<li data-time="11:30">11:30</li>',
                        '<li data-time="12:00">12:00</li>',
                        '<li data-time="12:30">12:30</li>',
                        '<li data-time="13:00">13:00</li>',
                        '<li data-time="13:30">13:30</li>',
                        '<li data-time="14:00">14:00</li>',
                        '<li data-time="14:30">14:30</li>',
                        '<li data-time="15:00">15:00</li>',
                        '<li data-time="15:30">15:30</li>',
                        '<li data-time="16:00">16:00</li>',
                        '<li data-time="16:30">16:30</li>',
                        '<li data-time="17:00">17:00</li>',
                        '<li data-time="17:30">17:30</li>',
                        '<li data-time="18:00">18:00</li>',
                        '<li data-time="18:30">18:30</li>',
                        '<li data-time="19:00">19:00</li>',
                        '<li data-time="19:30">19:30</li>',
                        '<li data-time="20:00">20:00</li>',
                        '<li data-time="20:30">20:30</li>',
                        '<li data-time="21:00">21:00</li>',
                        '<li data-time="21:30">21:30</li>',
                        '<li data-time="22:00">22:00</li>',
                        '<li data-time="22:30">22:30</li>',
                        '<li data-time="23:00">23:00</li>',
                        '<li data-time="23:30">23:30</li>'
                    ];
                    expect(picker.startCalendar.timePicker.$el.html()).toEqual(lis.join(''));
                });
            });

            describe('when the start calendar time picker field is clicked', function() {
                var $timeField;

                beforeEach(function() {
                    $timeField = picker.startCalendar._getTimeField().click();
                });

                afterEach(function() {
                    $('.bw-time-picker').remove();
                });

                it('shows a time picker for the start calendar', function() {
                    expect(picker.startCalendar.timePicker.$el.is(':visible')).toEqual(true);
                });

                describe('when the end calendar time picker field is clicked while the start time picker is open', function() {
                    beforeEach(function() {
                        picker.endCalendar.$el.find('input[name="time"]').click();
                    });

                    it('hides the start calendar time picker and shows the end calendar time picker', function() {
                        expect(picker.startCalendar.timePicker.$el.is(':visible')).toEqual(false);
                        expect(picker.endCalendar.timePicker.$el.is(':visible')).toEqual(true);
                    });
                });
            });

            describe('when the end calendar time picker field is clicked', function() {
                beforeEach(function() {
                    picker.endCalendar.$el.find('input[name="time"]').click();
                });

                afterEach(function() {
                    $('.bw-time-picker').remove();
                });

                it('shows a time picker for the end calendar', function() {
                    expect(picker.endCalendar.timePicker.$el.is(':visible')).toEqual(true);
                });

                describe('when the start calendar time picker field is clicked while the end time picker is open', function() {
                    beforeEach(function() {
                        picker.startCalendar._getTimeField().click();
                    });

                    it('hides the start calendar time picker and shows the end calendar time picker', function() {
                        expect(picker.startCalendar.timePicker.$el.is(':visible')).toEqual(true);
                        expect(picker.endCalendar.timePicker.$el.is(':visible')).toEqual(false);
                    });
                });
            });

            describe('when a time is clicked on the time picker', function() {
                var $timeField;

                beforeEach(function() {
                    $timeField = picker.startCalendar._getTimeField();

                    $timeField.click();
                    picker.startCalendar.timePicker.$el.find('[data-time="05:00"]').click();
                });

                afterEach(function() {
                    $('.bw-time-picker').remove();
                });

                it('updates the time field to show the associated time', function() {
                    expect(picker.startCalendar._getTimeField().val()).toEqual('05:00');
                });

                it('closes the time picker', function() {
                    expect(picker.startCalendar.timePicker.$el.is(':visible')).toEqual(false);
                });

                describe('when the time picker field looses then regains focus', function() {
                    beforeEach(function() {
                        $timeField.blur();
                        $timeField.focus();
                    });
                    it('should open the time picker', function() {
                        expect(picker.startCalendar.timePicker.$el.is(':visible')).toEqual(true);
                    });
                });

                describe('when the time picker is reopened after a time has been picked', function() {
                    beforeEach(function() {
                        picker.startCalendar.timePicker.$el.hide();
                        picker.startCalendar._getTimeField().click();
                    });

                    it('should show the last selected time highlighted', function() {
                        var selectedTime = picker.startCalendar.timePicker.$el.find('[data-time="05:00"]');
                        expect(selectedTime.hasClass('selected')).toEqual(true);
                    });

                    it('should remove the selected class if a different time is picked', function() {
                        var selectedTime = picker.startCalendar.timePicker.$el.find('[data-time="06:00"]');
                        selectedTime.click();

                        expect(selectedTime.hasClass('selected')).toEqual(true);
                        expect(picker.startCalendar.timePicker.$el.find('li.selected').length).toEqual(1);
                    });

                    it('should only highlight the last selected item not previously selected items', function() {
                        picker.startCalendar.timePicker.$el.trigger('mouseenter');
                        picker.startCalendar.timePicker.$el.find('[data-time="06:00"]').click();

                        picker.startCalendar.timePicker.$el.trigger('mouseleave');
                        expect(picker.startCalendar.timePicker.$el.find('li.selected').length).toEqual(1);
                        expect(picker.startCalendar.timePicker.$el.find('[data-time="06:00"]').hasClass('selected')).toEqual(true);
                    });
                });

                describe('when the end time is earlier than the start time', function() {
                    beforeEach(function() {
                        picker.endCalendar.$el.find('input[name="time"]').click();
                        picker.endCalendar.timePicker.$el.find('[data-time="02:00"]').click();
                    });

                    it('should change and highlight the correct start time', function() {
                        var selectedTime = picker.startCalendar.timePicker.$el.find('[data-time="02:00"]');

                        expect(picker.startCalendar._getTimeField().val()).toEqual('02:00');
                        expect(selectedTime.hasClass('selected')).toEqual(true);
                    });
                });
            });

            describe('when scrolling the time picker to show the current time', function() {
                var timePicker,
                    $timeField,
                    params = [{
                        timePickerHeight: 90,
                        selectedTimeHeight: 30,
                        currentTime: '06:00', // index 12
                        expectedScrollAdjustment: 330 // (12 * 30) - 30
                    }, {
                        timePickerHeight: 90,
                        selectedTimeHeight: 30,
                        currentTime: '00:30', // index 1
                        expectedScrollAdjustment: 0 // (1 * 30) - 30
                    }, {
                        timePickerHeight: 90,
                        selectedTimeHeight: 30,
                        currentTime: '19:00', // index 38
                        expectedScrollAdjustment: 1110 // (38 * 30) - 30
                    }];


                beforeEach(function() {
                    $timeField = picker.startCalendar._getTimeField();
                    timePicker = picker.startCalendar.timePicker;

                    timePicker.$el.css('position', 'relative'); // for $.position() to work

                    sandbox.spy(timePicker.$el, 'scrollTop');
                });

                params.forEach(function(param) {
                    var testDesc = '';

                    testDesc += 'time picker height is ' + param.timePickerHeight + ', ';
                    testDesc += 'list item height is ' + param.selectedTimeHeight + ', ';
                    testDesc += 'and current time is ' + param.currentTime;

                    describe('when ' + testDesc, function() {
                        it('should scroll the time picker by ' + param.expectedScrollAdjustment + 'px', function() {
                            var $nearestPresetTime = timePicker.$el.find('[data-time="' + param.currentTime + '"]');

                            sandbox.stub(timePicker.$el, 'outerHeight').returns(param.timePickerHeight);
                            sandbox.stub(timePicker, '_findListItemByTime').returns($nearestPresetTime);

                            $nearestPresetTime.outerHeight = sandbox.stub().returns(param.selectedTimeHeight);

                            $timeField.val(param.currentTime).click();

                            expect(timePicker.$el.scrollTop.args[0][0]).toEqual(param.expectedScrollAdjustment);
                        });
                    });
                });
            });

            describe('when a custom time has been selected', function() {
                var timePicker,
                    $timeField,
                    params = [{
                        customTime: '05:10',
                        presetTime: '05:00',
                    }, {
                        customTime: '05:20',
                        presetTime: '05:30',
                    }, {
                        customTime: '05:45',
                        presetTime: '06:00',
                    }, {
                        customTime: '05:38',
                        presetTime: '05:30',
                    }, {
                        customTime: '05:53',
                        presetTime: '06:00',
                    }];

                beforeEach(function() {
                    $timeField = picker.startCalendar._getTimeField();
                    timePicker = picker.startCalendar.timePicker;

                    timePicker.$el.css({
                        'position': 'relative',
                        'height': 90
                    });

                    sandbox.spy(timePicker.$el, 'scrollTop');
                });

                params.forEach(function(param) {
                    describe('when the custom time is ' + param.customTime, function() {
                        var presetTimeScrollAdjustment,
                            customTimeScrollAdjustment;

                        it('should scroll the time picker as if the selected time was ' + param.presetTime, function() {
                            $timeField.val(param.presetTime);
                            $timeField.click();

                            presetTimeScrollAdjustment = timePicker.$el.scrollTop.args[0][0];

                            $timeField.blur();
                            timePicker.$el.scrollTop.reset();

                            $timeField.val(param.customTime);
                            $timeField.click();

                            customTimeScrollAdjustment = timePicker.$el.scrollTop.args[0][0];

                            expect(presetTimeScrollAdjustment).toEqual(customTimeScrollAdjustment);
                        });
                    });
                });
            });


            describe('when the mouse hovers over the time picker after a time has been selected', function() {
                beforeEach(function() {
                    picker.startCalendar._getTimeField().click();
                    picker.startCalendar.timePicker.$el.find('[data-time="02:00"]').click();

                    picker.startCalendar._getTimeField().click();
                    picker.startCalendar.timePicker.$el.find('li').first().trigger('mouseenter');
                });

                it('should remove the highlight from the currently selected time by changing its class', function() {
                    expect(picker.startCalendar.timePicker.$el.find('[data-time="02:00"]').hasClass('-selected')).toEqual(true);
                });

                it('should add the highlight when the mouse leaves the time picker', function() {
                    picker.startCalendar.timePicker.$el.find('li').first().trigger('mouseleave');
                    expect(picker.startCalendar.timePicker.$el.find('[data-time="02:00"]').hasClass('selected')).toEqual(true);
                });
            });

            describe('when the datepicker is closed while a time picker is open', function() {
                beforeEach(function() {
                    picker.startCalendar._getTimeField().click();
                    picker.$el.find('button.done').click();
                });

                it('should close the time picker', function() {
                    expect(picker.startCalendar.timePicker.$el.is(':visible')).toEqual(false);
                });
            });

            describe('when the time picker field gains focus', function() {
                beforeEach(function() {
                    picker.startCalendar._getTimeField().trigger('focus');
                });

                it('opens the time picker list', function() {
                    expect(picker.startCalendar.timePicker.$el.is(':visible')).toEqual(true);
                });
            });

            describe('when the time picker field looses focus while the time picker is open', function() {
                var timePickerHideSpy,
                    $timeField;

                beforeEach(function() {
                    $timeField = picker.startCalendar._getTimeField();
                    timePickerHideSpy = sinon.spy(picker.startCalendar.timePicker.$el, 'hide');
                    $timeField.click().blur();
                });

                afterEach(function() {
                    timePickerHideSpy.reset();
                });

                it('should close the end calendar time picker', function() {
                    expect(picker.startCalendar.timePicker.$el.is(':visible')).toEqual(false);
                    expect(timePickerHideSpy.calledOnce).toEqual(true);
                });
            });

            describe('when the time picker field looses focus while user is selecting a time', function() {
                var timePickerHideSpy,
                    $timeField;

                beforeEach(function() {
                    $timeField = picker.startCalendar._getTimeField();
                    timePickerHideSpy = sinon.spy(picker.startCalendar.timePicker.$el, 'hide');

                    $timeField.click();

                    picker.startCalendar.timePicker.$el.find('li').first().trigger('mousedown');
                });

                afterEach(function() {
                    timePickerHideSpy.reset();
                });

                describe('when the user has triggered mousedown on the time picker (e.g. after clicking a list item)', function() {
                    it('should keep the time picker open', function() {
                        $timeField.trigger('blur');

                        expect(picker.startCalendar.timePicker.$el.is(':visible')).toEqual(true);
                        expect(timePickerHideSpy.called).toEqual(false);
                    });
                });

                describe('when the user has triggered mouseup on the time picker (e.g. after clicking scrollbar)', function() {
                    it('should close the time picker', function() {
                        picker.startCalendar.timePicker.$el.trigger('mouseup');

                        $timeField.trigger('blur');

                        expect(picker.startCalendar.timePicker.$el.is(':visible')).toEqual(false);
                        expect(timePickerHideSpy.calledOnce).toEqual(true);
                    });
                });
            });

            describe('when a start time later than the end time is picked', function() {
                beforeEach(function() {
                    picker.startCalendar.$el.find('.day[data-date="2014-01-01"]').first().click();
                    picker.endCalendar.$el.find('.day[data-date="2014-01-01"]').first().click();

                    picker.endCalendar.$el.find('input[name="time"]').click();
                    picker.endCalendar.timePicker.$el.find('[data-time="10:00"]').click();

                    picker.startCalendar._getTimeField().click();
                    picker.startCalendar.timePicker.$el.find('[data-time="18:00"]').click();
                });


                it('should set both time picker fields to the later time', function() {
                    expect(picker.startCalendar._getTimeField().val()).toEqual('18:00');
                    expect(picker.endCalendar.$el.find('input[name="time"]').val()).toEqual('18:00');
                });
            });

            describe('when an end time earlier than the start time is picked', function() {
                beforeEach(function() {
                    picker.startCalendar.$el.find('.day[data-date="2014-01-01"]').first().click();
                    picker.endCalendar.$el.find('.day[data-date="2014-01-01"]').first().click();

                    picker.startCalendar._getTimeField().click();
                    picker.startCalendar.timePicker.$el.find('[data-time="13:00"]').click();

                    picker.endCalendar.$el.find('input[name="time"]').click();
                    picker.endCalendar.timePicker.$el.find('[data-time="10:00"]').click();
                });


                it('should set both time picker fields to the earlier time', function() {
                    expect(picker.startCalendar._getTimeField().val()).toEqual('10:00');
                    expect(picker.endCalendar.$el.find('input[name="time"]').val()).toEqual('10:00');
                });
            });
        });

        describe('as a jquery plugin', function(){
            var input,
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
                    }
                });
            });

            afterEach(function(){
                input.data('picker').destroy();
                $('#testArea').empty();
            });

            it('attaches a picker instance to the target element', function(){
                expect(input.data('picker')).toBeDefined();
            });

            it('passes supplied options through to the picker', function(){
                input.click();

                var picker = input.data('picker');

                expect(picker.startCalendar.selectedDate.toString()).toEqual(moment([2013,0,1]).toString());
                expect(picker.endCalendar.selectedDate.toString()).toEqual(moment([2013,1,14]).toString());
            });

            it('shows the picker when the target element is clicked', function(){
                var showStub = sinon.stub(daterangepicker.prototype, 'show');

                input.click();

                expect(showStub.calledOnce).toEqual(true);

                showStub.restore();
            });

            it('shows the picker with a custom z-index', function(){
                var jqShowStub = sinon.stub($.prototype, 'show', function(){ return this; }),
                    jqCssStub = sinon.stub($.prototype, 'css', function(){ return this; });

                input.click();

                expect(jqShowStub.calledOnce).toEqual(true);

                expect(jqCssStub.calledOnce).toEqual(true);
                expect(jqCssStub.args[0][0].zIndex).toEqual(1234);

                jqShowStub.restore();
                jqCssStub.restore();
            });

            it('hides the picker when a click occurs outside the picker area', function(){
                var hideStub = sinon.stub(daterangepicker.prototype, 'hide');

                input.click();
                $('body').click();

                expect(hideStub.calledOnce).toEqual(true);

                hideStub.restore();
            });

            it('updates the target element when a start date is selected', function(){
                input.click();

                var picker = input.data('picker');

                picker.startCalendar.$el.find('[data-date="2013-01-01"]').click();

                expect(input.val()).toEqual('01 Jan 2013 - 14 Feb 2013');
            });

            it('updates the target element when an end date is selected', function(){
                input.click();

                var picker = input.data('picker');

                picker.endCalendar.$el.find('[data-date="2013-03-01"]').click();

                expect(input.val()).toEqual('01 Jan 2013 - 01 Mar 2013');
            });

            it('updates the target element when a preset date is selected', function(){
                input.click();

                var picker = input.data('picker');

                picker.$el.find('.presets li').eq(0).click();

                expect(input.val()).toEqual('25 Dec 2012 - 25 Dec 2012');
            });
        });

        describe('as a jquery plugin with time picker support', function() {
            var input, picker;

            beforeEach(function() {
                input = $('<input type="text" />');
                $('#testArea').append(input);

                input.daterangepicker({
                    zIndex: 1234,
                    startDate: '2013-01-01',
                    endDate: '2013-02-14',
                    timePicker: true
                });
                $('#testArea').append(input);

                input.click();

                picker = input.data('picker');
            });

            afterEach(function() {
                input.data('picker').destroy();
                $('#testArea').empty();
            });

            describe('when a time is not picked', function() {
                beforeEach(function() {
                    picker.startCalendar.$el.find('[data-date="2013-01-01"]').click();
                    picker.endCalendar.$el.find('[data-date="2013-02-14"]').click();
                });

                it('updates the target element with the dates formatted without time', function() {
                    expect(input.val()).toEqual('01 Jan 2013 - 14 Feb 2013');
                    expect(picker.startCalendar._getTimeField().val()).toEqual('--:--');
                    expect(picker.endCalendar.$el.find('input[name="time"]').val()).toEqual('--:--');
                });
            });


            describe('when a time is picked', function() {
                beforeEach(function() {
                    picker.startCalendar.$el.find('[data-date="2013-01-01"]').click();
                    picker.endCalendar.$el.find('[data-date="2013-02-14"]').click();

                    picker.startCalendar._getTimeField().val('10:00').trigger('change');
                    picker.endCalendar.$el.find('input[name="time"]').val('14:00').trigger('change');
                });

                it('updates the target element with the dates formatted with time', function() {
                    expect(input.val()).toEqual('10:00 01 Jan 2013 - 14:00 14 Feb 2013');
                });
            });


            describe('when the time from the start calendar is reset', function() {
                beforeEach(function() {
                    picker.startCalendar.$el.find('[data-date="2013-01-01"]').click();
                    picker.endCalendar.$el.find('[data-date="2013-02-14"]').click();

                    picker.startCalendar._getTimeField().val('10:00').trigger('change');
                    picker.endCalendar.$el.find('input[name="time"]').val('14:00').trigger('change');

                    picker.startCalendar._getTimeField().val('--:--').trigger('change');
                });

                it('updates the target element and formats the start date without time', function() {
                    expect(input.val()).toEqual('01 Jan 2013 - 14:00 14 Feb 2013');
                });
            });

            describe('when the time from the end calendar is reset', function() {
                beforeEach(function() {
                    picker.startCalendar.$el.find('[data-date="2013-01-01"]').click();
                    picker.endCalendar.$el.find('[data-date="2013-02-14"]').click();

                    picker.startCalendar._getTimeField().val('10:00').trigger('change');
                    picker.endCalendar.$el.find('input[name="time"]').val('14:00').trigger('change');

                    picker.endCalendar.$el.find('input[name="time"]').val('--:--').trigger('change');
                });

                it('updates the target element and formats the start date without time', function() {
                    expect(input.val()).toEqual('10:00 01 Jan 2013 - 14 Feb 2013');
                });
            });

            describe('when an invalid start time is entered', function() {
                beforeEach(function() {
                    picker.startCalendar.$el.find('[data-date="2013-01-01"]').click();
                    picker.endCalendar.$el.find('[data-date="2013-02-14"]').click();

                    picker.startCalendar._getTimeField().val('10:00').trigger('change');
                    picker.endCalendar.$el.find('input[name="time"]').val('14:00').trigger('change');

                    picker.startCalendar._getTimeField().val('A10:B00').trigger('change');
                });

                it('updates the target element and reverts to the previously valid date/time', function() {
                    expect(input.val()).toEqual('10:00 01 Jan 2013 - 14:00 14 Feb 2013');
                });
            });

            describe('when an invalid end time is entered', function() {
                beforeEach(function() {
                    picker.startCalendar.$el.find('[data-date="2013-01-01"]').click();
                    picker.endCalendar.$el.find('[data-date="2013-02-14"]').click();

                    picker.startCalendar._getTimeField().val('10:00').trigger('change');
                    picker.endCalendar.$el.find('input[name="time"]').val('14:00').trigger('change');

                    picker.endCalendar.$el.find('input[name="time"]').val('A14:B00').trigger('change');
                });

                it('updates the target element and reverts to the previously valid date/time', function() {
                    expect(input.val()).toEqual('10:00 01 Jan 2013 - 14:00 14 Feb 2013');
                });
            });

            describe('when the start time value is deleted', function() {
                beforeEach(function() {
                    picker.startCalendar.$el.find('[data-date="2013-01-01"]').click();
                    picker.endCalendar.$el.find('[data-date="2013-02-14"]').click();

                    picker.startCalendar._getTimeField().val('10:00').trigger('change');
                    picker.endCalendar.$el.find('input[name="time"]').val('14:00').trigger('change');

                    picker.startCalendar._getTimeField().val('').trigger('change');
                });

                it('updates the target element and formats the start date without time', function() {
                    expect(input.val()).toEqual('01 Jan 2013 - 14:00 14 Feb 2013');
                });
            });

            describe('when the end time value is deleted', function() {
                beforeEach(function() {
                    picker.startCalendar.$el.find('[data-date="2013-01-01"]').click();
                    picker.endCalendar.$el.find('[data-date="2013-02-14"]').click();

                    picker.startCalendar._getTimeField().val('10:00').trigger('change');
                    picker.endCalendar.$el.find('input[name="time"]').val('14:00').trigger('change');

                    picker.endCalendar.$el.find('input[name="time"]').val('').trigger('change');
                });

                it('updates the target element and formats the end date without time', function() {
                    expect(input.val()).toEqual('10:00 01 Jan 2013 - 14 Feb 2013');
                });
            });
        });
    });
});
