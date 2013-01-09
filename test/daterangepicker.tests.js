define(['lib/daterangepicker/daterangepicker'],
    function(daterangepicker){
    'use strict';
    describe('daterangepicker', function(){
        var picker;

        afterEach(function(){
            if(picker){
                picker.destroy();
                picker = undefined;
            }
        });

        describe('a datepicker calendar', function(){
            var calendar;

            beforeEach(function(){
                picker = daterangepicker.create();
                calendar = picker._createCalendar(11, 2012, '2012-12-25', 'myCalendar');
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
                    expect(calendar.selectedDate).toEqual(moment([2012,11,25]));
                });

                it('stores the selected month', function(){
                    expect(calendar.selectedMonth).toEqual(moment([2012,11,1]));
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

                it('changes the day td with the selected class when a day is clicked', function(){
                    var newDate = calendar.$el.find('.day[data-date="2012-12-01"]');

                    newDate.click();

                    expect(newDate.hasClass('selected')).toEqual(true);
                    expect(calendar.$el.find('.selected').length).toEqual(1);
                });

                it('updates the month if the date clicked is not on this.selectedMonth', function(){
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

                it('updates this.selectedMonth when next is clicked', function(){
                    calendar.$el.find('.next').click();

                    expect(calendar.selectedMonth.month()).toEqual(0);
                    expect(calendar.selectedMonth.year()).toEqual(2013);
                });

                it('re-renders when next is clicked', function(){
                    var renderStub = sinon.stub(calendar, 'render');

                    calendar.$el.find('.next').click();

                    expect(renderStub.calledOnce).toEqual(true);
                });

                it('updates this.selectedMonth when previous is clicked', function(){
                    calendar.$el.find('.prev').click();

                    expect(calendar.selectedMonth.month()).toEqual(10);
                    expect(calendar.selectedMonth.year()).toEqual(2012);
                });

                it('re-renders when previous is clicked', function(){
                    var renderStub = sinon.stub(calendar, 'render');

                    calendar.$el.find('.prev').click();

                    expect(renderStub.calledOnce).toEqual(true);
                });
            });

            describe('showing a month', function(){
                beforeEach(function(){
                    calendar.render();
                });

                it('updates this.selectedMonth', function(){
                    calendar.showMonth(2010,0);

                    expect(calendar.selectedMonth).toEqual(moment([2010,0]));
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
                        endDate = moment([2012,0,2]);

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

        describe('a DateRangePicker', function(){

            describe('initialization', function(){

                describe('defaults', function(){
                    beforeEach(function(){
                        picker = daterangepicker.create();
                    });

                    it('creates a calendar for the current month as this.startCalendar', function(){
                        var now = moment();

                        expect(picker.startCalendar).toBeDefined();
                        expect(picker.startCalendar.selectedMonth.month()).toEqual(now.month());
                    });

                    it('creates a calendar for the current month as this.endCalendar', function(){
                        var now = moment();

                        expect(picker.endCalendar).toBeDefined();
                        expect(picker.endCalendar.selectedMonth.month()).toEqual(now.month());
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

            });

            describe('rendering', function(){
                var startCalendarRenderSpy,
                    endCalendarRenderSpy;

                beforeEach(function(){
                    picker = daterangepicker.create();

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
                    expect(picker.startCalendar.$el.parent().is(picker.$el)).toEqual(true);
                });

                it('renders the endCalendar into this.$el', function(){
                    expect(endCalendarRenderSpy.calledOnce).toEqual(true);
                    expect(picker.endCalendar.$el.parent().is(picker.$el)).toEqual(true);
                });
            });

            describe('events', function(){
                beforeEach(function(){
                    picker = daterangepicker.create({
                        startDate: '2012-12-01',
                        endDate: '2012-12-31',
                        selectedDate: '2012-12-25'
                    });
                    picker.render();
                });

                it('changes the this.endCalendar.selectedDate if a later date is clicked on this.startCalendar', function(){
                    picker.startCalendar.updateSelectedDate('2014-01-01');

                    expect(picker.endCalendar.selectedDate.unix()).toEqual(picker.startCalendar.selectedDate.unix());
                });

                it('changes the this.startCalendar.selectedDate if an earlier date is clicked on this.endCalendar', function(){
                    picker.endCalendar.updateSelectedDate('2011-01-01');

                    expect(picker.endCalendar.selectedDate.unix()).toEqual(picker.startCalendar.selectedDate.unix());
                });

                it('calls this.highlightRange when the startCalendar raises an onDateSelected event', function(){
                    var highlightRangeSpy = sinon.spy(picker, 'highlightRange');

                    picker.startCalendar.trigger('onDateSelected', { date: '2012-12-01' });

                    expect(highlightRangeSpy.calledOnce).toEqual(true);
                    expect(highlightRangeSpy.args[0][0].unix()).toEqual(moment([2012,11,1]).unix());
                    expect(highlightRangeSpy.args[0][1].unix()).toEqual(picker.getEndDate().unix());
                });

                it('calls this.highlightRange when the endCalendar raises an onDateSelected event', function(){
                    var highlightRangeSpy = sinon.spy(picker, 'highlightRange');

                    picker.endCalendar.trigger('onDateSelected', { date: '2012-12-30' });

                    expect(highlightRangeSpy.calledOnce).toEqual(true);
                    expect(highlightRangeSpy.args[0][0].unix()).toEqual(moment([2012,11,25]).unix());
                    expect(highlightRangeSpy.args[0][1].unix()).toEqual(moment([2012,11,30]).unix());
                });
            });

            describe('highlighting cells', function(){
                var startCalendarHighlightCellsSpy,
                    endCalendarHighlightCellsSpy;

                beforeEach(function(){
                    picker = daterangepicker.create();
                    picker.render();

                    startCalendarHighlightCellsSpy = sinon.spy(picker.startCalendar, 'highlightCells');
                    endCalendarHighlightCellsSpy = sinon.spy(picker.endCalendar, 'highlightCells');
                });

                it('calls this.startCalendar.highlightCells with the correct dates', function(){
                    var startDate = moment([2012,11,1]),
                        endDate = moment([2012,11,31]);

                    picker.highlightRange(startDate, endDate);

                    expect(startCalendarHighlightCellsSpy.calledOnce).toEqual(true);
                    expect(startCalendarHighlightCellsSpy.args[0][0]).toEqual(startDate);
                    expect(startCalendarHighlightCellsSpy.args[0][1]).toEqual(endDate);
                });

                it('calls this.endCalendar.highlightCells with the correct dates', function(){
                    var startDate = moment([2012,11,1]),
                        endDate = moment([2012,11,31]);

                    picker.highlightRange(startDate, endDate);

                    expect(endCalendarHighlightCellsSpy.calledOnce).toEqual(true);
                    expect(endCalendarHighlightCellsSpy.args[0][0]).toEqual(startDate);
                    expect(endCalendarHighlightCellsSpy.args[0][1]).toEqual(endDate);
                });

                it('does not call either calendar\'s highlight cells method if an invalid date range is used', function(){
                    var startDate = moment([2012,11,31]),
                        endDate = moment([2012,11,1]);

                    picker.highlightRange(startDate, endDate);

                    expect(startCalendarHighlightCellsSpy.called).toEqual(false);
                    expect(endCalendarHighlightCellsSpy.called).toEqual(false);
                });
            });

        });

    });
});