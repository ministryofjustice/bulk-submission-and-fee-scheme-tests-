Feature: Duplicate checks - Mediation

  Background:
    Given I am on the bulk import page

    @temp
  Scenario Outline: First occurrence is accepted
    When I generate "Mediation" "<format>" file with "2" outcomes
    And I upload the generated file and wait for import in progress
    Then I should see the submission summary for "Mediation" with "2" claims
    Examples:
      | format |
      | csv    |
      | xml    |
      | txt    |



