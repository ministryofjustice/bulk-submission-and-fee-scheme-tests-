@bulkSubmission @matterStarts
Feature: Matter Starts Uploads

  Scenario: Successful bulk submission for legal help matter starts
    Given I am on the bulk import page
    When I generate "Legal help" "csv" with all matter type file
    And I upload the generated file
    Then I should see the submission summary for "Legal help" with matter starts matching the generated file

Scenario: Successful bulk submission for mediation matter starts
    Given I am on the bulk import page
    When I generate "Mediation" "csv" with all matter type file
    And I upload the generated file
    Then I should see the submission summary for "Mediation" with matter starts matching the generated file
