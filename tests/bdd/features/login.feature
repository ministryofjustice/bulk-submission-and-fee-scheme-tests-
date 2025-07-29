Feature: Login
  Scenario: I login to the UI
    Given I am on the login screen
    When I enter my credentials
    And I click the submit button
    Then I should be redirected to the home page