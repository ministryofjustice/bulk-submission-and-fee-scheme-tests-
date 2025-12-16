@accessibility @uploadProcess
Feature: Upload a bulk claim file page (UP)

  Scenario: UP1 accessibility checks
    Given I start from a clean logged-in state
    When I am on the bulk import page
    Then the page should have no accessibility violations

  Scenario: UP1-ERR accessibility checks
    Given I start from a clean logged-in state
    And I am on the bulk import page
    And I have generated an "empty" bulk submission file named "emptyFile.csv"
    When I upload that file
    Then the page should have no accessibility violations

  Scenario: UP2 accessibility checks
    Given I start from a clean logged-in state
    And I am on the bulk import page
    And I generate "Legal help" "csv" file with "1" outcomes
    When I upload the generated file and wait for import in progress screen
    Then the page should have no accessibility violations