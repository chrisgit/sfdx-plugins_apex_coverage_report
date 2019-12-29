public with sharing class PercentCalculator {
    public Decimal increaseByPercentage(Decimal value, Decimal percentage) {
        return value + ((value / 100) * percentage);
    }

    public Decimal increaseAsPercentage(Decimal originalValue, Decimal newValue) {
        Decimal increase = ((newValue - originalValue) / originalValue) * 100;
        return increase;
    }

    public Decimal asPercentageOf(Decimal total, Decimal partTotal) {
        return (partTotal / total) * 100;
    }
}
