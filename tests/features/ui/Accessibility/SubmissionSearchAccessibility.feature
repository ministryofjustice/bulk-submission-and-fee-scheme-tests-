@accessibility @submissionSearchAccessibility @temp
Feature: Submission search page (SS)

  Background:
    Given I am on the bulk import page
    When I generate "Legal help" "csv" file with "10" outcomes
    And I upload the generated file

  Scenario: SS1 accessibility checks
    Given I am on the Search page
    Then the page should have no accessibility violations

  Scenario: SS2 accessibility checks
    Given I determine a valid submission search date range for the past 1 days
    And I am on the Search page
    When I search using the valid date range
    Then the page should have no accessibility violations