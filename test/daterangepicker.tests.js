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
                calendar = picker.createCalendar(11, 2012, '2012-12-25', 'myCalendar');
            });

            it('stores the selected date', function(){
                expect(calendar.selectedDate).toEqual(moment([2012,11,25]));
            });

            it('stores the selected month', function(){
                expect(calendar.selectedMonth).toEqual(moment([2012,11,1]));
            });

            it('calculates the start date as the first monday', function(){
                expect(calendar.startDate.year()).toEqual(2012);
                expect(calendar.startDate.month()).toEqual(10);
                expect(calendar.startDate.date()).toEqual(26);
                expect(calendar.startDate.day()).toEqual(1);
            });

            it('sets this.$el to be an empty div', function(){
                expect(calendar.$el).toBeDefined();
                expect(calendar.$el.is('div')).toEqual(true);
                expect(calendar.$el.children().length).toEqual(0);
            });

            it('sets the className of this.$el', function(){
                expect(calendar.$el.hasClass('myCalendar')).toEqual(true);
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
            });
        });

    });
});