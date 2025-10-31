Feature: Duplicate checks - Legal Help

  Background:
    Given I am on the bulk import page

  Scenario Outline: First occurrence is accepted
    When I generate "Legal help" "<format>" file with "2" outcomes
    And I upload the generated file and wait for import in progress
    Then I should see the submission summary for "Crime lower" with "2" claims
    Examples:
      | format |
      | csv    |
      | xml    |
      | txt    |

  Scenario Outline: Duplicate detected against a previously submitted claim from <format>
    Given I generate "Legal help" "<format>" file with "0P322F" and "14091962/T/PERS"
    And I upload with generated file via the API
    When I upload the generated file and wait for import in progress
    Then I should have duplicate submission error for "0P322F" "Legal help"
    Examples:
      | format |
      | csv    |
      | xml    |
      | txt    |

  @temp
  Scenario Outline: Not duplicate when previous submission was invalid from <format>
    Given I generate "Legal help" "<format>" file with "0P322F" and "14091962/T/PERS"
    And I upload with generated file via the API
    And I make the generated file invalid
    When I upload the generated file and wait for import in progress
    Then I should see the submission summary for "Legal help"
    Examples:
      | format |
      | csv    |
      | xml    |
      | txt    |
