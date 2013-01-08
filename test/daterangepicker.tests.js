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

                it('triggers an onDayClicked event with the date clicked when a day is clicked', function(done){
                    calendar.bind('onDayClicked', function(args){
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
                    picker = daterangepicker.create();
                    picker.render();
                });

                it('updates this.startDate when this.startCalendar emits an onDayClicked event', function(){
                    picker.startCalendar.trigger('onDayClicked', { date: '2012-12-01' });

                    expect(picker.startDate).toEqual('2012-12-01');
                });

                it('updates this.endDate when this.endCalendar emits an onDayClicked event', function(){
                    picker.endCalendar.trigger('onDayClicked', { date: '2013-01-01' });

                    expect(picker.endDate).toEqual('2013-01-01');
                });
            });

        });

    });
});