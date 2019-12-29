@IsTest
public with sharing class PercentageCalculator_Test {
    @IsTest
    public static void whenicrease50By20PercentThenReturns60() {
        Decimal result = new PercentCalculator().increaseByPercentage(50, 20);

        System.assertEquals(60, result, 'Value not increased by percentage correctly');
    }

    @IsTest
    public static void when100increasedTo120ThenReturns20() {
        Decimal result = new PercentCalculator().increaseAsPercentage(100, 120);

        System.assertEquals(20, result, 'Increased value as percentage not calculated correctly');
    }    
}
