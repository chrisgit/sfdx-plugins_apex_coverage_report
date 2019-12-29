public with sharing class Untested {
    public static Organization getOrgDetails() {
        return [SELECT Id, IsSandbox, OrganizationType, TrialExpirationDate FROM Organization];
    }
}
