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
                calendar = picker.createCalendar(11, 2012);
            });

            it('creates an array of 42 dates', function(){
                expect(calendar._dates).toBeDefined();
                expect(calendar._dates.length).toEqual(42);

                expect(calendar._dates[0].date()).toEqual(26);
                expect(calendar._dates[0].month()).toEqual(10);

                expect(calendar._dates[41].date()).toEqual(6);
                expect(calendar._dates[41].month()).toEqual(0);
            });

            it('starts the dates on the first Monday', function(){
                expect(calendar._dates[0].day()).toEqual(1);
            });

            it('ends the dates on a Sunday', function(){
                expect(calendar._dates[41].day()).toEqual(0);
            });

        });

    });
});