@IsTest
public with sharing class Greeting_Test {
    @IsTest
    public static void whenMorningThenReturnsGoodMorning() {
        Integer hours = 9;
        Integer minutes = 0;
        Integer seconds = 0;
        Integer milliseconds = 0;

        string result = new Greeting().message(Time.newInstance(hours, minutes, seconds, milliseconds));

        System.assertEquals(Greeting.MESSAGE_MORNING, result, 'Greeting: failed to return correct morning message');
    }

    @IsTest
    public static void whenNightThenReturnGoodNight() {
        Integer hours = 18;
        Integer minutes = 15;
        Integer seconds = 0;
        Integer milliseconds = 0;

        string result = new Greeting().message(Time.newInstance(hours, minutes, seconds, milliseconds));

        System.assertEquals(Greeting.MESSAGE_NIGHT, result, 'Greeting: failed to return correct night message');
    }
}
