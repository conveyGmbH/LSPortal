@isTest
private class LeadSyncLogControllerTest {

    @TestSetup
    static void makeData() {
        insert new List<Lead_Sync_Log__c>{
            new Lead_Sync_Log__c(
                Status__c = 'Synced', RecordType__c = 'Lead',
                CompanyName__c = 'Siemens AG', ContactName__c = 'Anna Keller',
                Email__c = 'anna.keller@siemens.com', EventName__c = 'Hannover Messe 2026',
                SyncedAt__c = DateTime.now()
            ),
            new Lead_Sync_Log__c(
                Status__c = 'Failed', RecordType__c = 'Lead',
                CompanyName__c = 'Siemens AG', ContactName__c = 'Tim Braun',
                Email__c = 'tim.braun@siemens', EventName__c = 'Hannover Messe 2026',
                ErrorMessage__c = 'INVALID_EMAIL_ADDRESS: Email: invalid email address: tim.braun@siemens',
                SyncedAt__c = DateTime.now()
            ),
            new Lead_Sync_Log__c(
                Status__c = 'Duplicate', RecordType__c = 'Account + Contact',
                CompanyName__c = 'Siemens AG', ContactName__c = 'Lea Fischer',
                Email__c = 'lea.fischer@siemens.com', EventName__c = 'Hannover Messe 2026',
                SyncedAt__c = DateTime.now()
            )
        };
    }

    @isTest
    static void getDashboardData_returnsCountsAndSuccessRate() {
        Test.startTest();
        LeadSyncLogController.DashboardData result = LeadSyncLogController.getDashboardData(null, null, null);
        Test.stopTest();

        System.assertEquals(3, result.totalLeads);
        System.assertEquals(1, result.syncedCount);
        System.assertEquals(1, result.failedCount);
        System.assertEquals(1, result.duplicateCount);
        System.assertEquals(33.3, result.successRate);
    }

    @isTest
    static void getDashboardData_filtersByEventName() {
        Test.startTest();
        LeadSyncLogController.DashboardData result = LeadSyncLogController.getDashboardData('Nonexistent Event', null, null);
        Test.stopTest();

        System.assertEquals(0, result.totalLeads);
    }

    @isTest
    static void retrySync_throwsNotYetAvailable() {
        Lead_Sync_Log__c logRow = [SELECT Id FROM Lead_Sync_Log__c LIMIT 1];

        Test.startTest();
        try {
            LeadSyncLogController.retrySync(logRow.Id);
            System.assert(false, 'Expected AuraHandledException');
        } catch (AuraHandledException e) {
            System.assert(true);
        }
        Test.stopTest();
    }
}
