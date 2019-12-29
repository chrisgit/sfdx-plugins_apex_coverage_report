public with sharing class Greeting {
    public static final string MESSAGE_MORNING = 'Good morning';
    public static final string MESSAGE_AFTERNOON = 'Good afternoon';
    public static final string MESSAGE_NIGHT = 'Good night';

    public string message(Time timeOfDay) {
        if (timeOfDay.hour() > 6 && timeOfDay.hour() < 12) {
            return MESSAGE_MORNING;
        }
        if (timeOfDay.hour() >= 12 && timeOfDay.hour() < 18) {
            return MESSAGE_AFTERNOON;
        }
        return MESSAGE_NIGHT;
    }
}
