@accessibility @submissionSearchAccessibility
Feature: Submission search page (SS)

  Background:
    Given I am on the bulk import page
    When I generate "Legal help" "csv" file with "10" outcomes
    And I upload the generated file

  Scenario: SS1 accessibility checks
    Given I am on the Search page
    Then the page should have no accessibility violations whilst ignoring the following rules
    # Both date pickers on the page use an invisible element which is referenced via a
    # `aria-controls` attribute. This shows as a false positive in this test so
    # ignoring this rule
      | aria-valid-attr-value |

  Scenario: SS2 accessibility checks
    Given I determine a valid submission search criteria
    And I am on the Search page
    When I search using the valid search criteria
    Then the page should have no accessibility violations whilst ignoring the following rules
    # Both date pickers on the page use an invisible element which is referenced via a
    # `aria-controls` attribute. This shows as a false positive in this test so
    # ignoring this rule
      | aria-valid-attr-value |