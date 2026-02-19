@search @stable
Feature: Bulk Submission Search

  Background:
    And I start from a clean logged-in state

  Scenario: Search with no filter specified
    Given I am on the Search page
    When I click search
    Then I should see search results

  Scenario: Search for submissions via all fields
    Given I determine a valid submission search criteria
    And I am on the Search page
    When I search using the valid search criteria
    Then the Search page should pass accessibility checks
    Then I should see results matching the expected count

  Scenario: Search for submissions via Submission Period
    Given I determine a valid submission period for search criteria
    And I am on the Search page
    When I search using the valid search criteria
    Then the Search page should pass accessibility checks
    Then I should see results matching the expected count

  Scenario: Search for submissions via Area of Law
    Given I determine a valid area of law for search criteria
    And I am on the Search page
    When I search using the valid search criteria
    Then the Search page should pass accessibility checks
    Then I should see results matching the expected count

  Scenario: Search for submissions via Submission Status
    Given I determine a valid submissions status for search criteria
    And I am on the Search page
    When I search using the valid search criteria
    Then the Search page should pass accessibility checks
    Then I should see results matching the expected count

  Scenario: Search for submissions via Office Account
    Given I determine a valid office account for search criteria
    And I am on the Search page
    When I search using the valid search criteria
    Then the Search page should pass accessibility checks
    Then I should see results matching the expected count

  @inputValidation
  Scenario: Validate office is selected
    Given I determine a valid submission search criteria
    And I am on the Search page
    When I deselect all office accounts
    And I click search
    Then I should see the following validation messages:
      | You must select an office account |

  Scenario: Search with a past date range that returns no submissions
    Given I choose a submission period with no submissions
    And I am on the Search page
    When I search using the valid search criteria
    Then I should see a message saying "No submissions were found."
    Then the Search page should pass accessibility checks
