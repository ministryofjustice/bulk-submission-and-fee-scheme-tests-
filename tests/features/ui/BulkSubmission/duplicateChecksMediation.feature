@duplicateChecks
@bulkSubmission @stable
Feature: Duplicate checks - Mediation

  Background:
    Given I start from a clean logged-in state
    Given I am on the bulk import page

  Scenario Outline: First occurrence is accepted
    When I generate "Mediation" "<format>" file with "2" outcomes
    And I upload the generated file and wait for import in progress
    Then I should see the submission summary for "Mediation" with "2" claims
    Examples:
      | format |
      | xml    |

  Scenario Outline: Duplicate detected against a previously submitted claim from <format>
    Given I generate "Mediation" "<format>" file with the following claims
      | ucn             | ufn        | feeCode | office |
      | 14091962/T/PERS | 010725/123 | ASSA    | 1T102C |
    And I upload the generated file
    And click import
    Given I generate "Mediation" "<format>" file with the following claims
      | ucn             | ufn        | feeCode | office |
      | 14091962/T/PERS | 010725/123 | ASSA    | 1T102C |
    When I upload the generated file
    Then I should see an error banner saying "1 claim has errors for missing or incorrect information"
    And I should see the following submission error messages for "<AreaOfLaw>":
      | Error Message                                     |
      | A duplicate claim was found in another submission |

    Examples:
      | format |
      | xml    |


  Scenario Outline: Should have no errors in <format> submission (UCN different)
    Given I generate "Mediation" "<format>" file with the following claims
      | ucn                  | feeCode |
      | 07081996/S/<format>E | ASSA    |
      | 07081997/S/<format>E | ASSA    |
    And I upload the generated file
    And click import
    When I upload the generated file and wait for import in progress
    Then I should have duplicate submission error for "0P322F" "Mediation"
      | submission period |
    Examples:
      | format |
      | xml    |

  Scenario Outline: Not duplicate when previous submission was invalid from <format>
    Given I generate "Mediation" "<format>" file with the following claims
      | ucn            |
      | 14091962/T/0.8 |
    And I upload the generated file
    Then I should see an error banner saying "1 claim has errors for missing or incorrect information"
    And I update only the last record with a new UCN
      | ucn             |
      | 14091962/T/OLAS |
    And click import
    When I upload the generated file
    Then I should see the submission summary for "Mediation"
    Examples:
      | format |
      | csv    |


  Scenario Outline: Should have no errors in <format> submission (fee code different)
    Given I generate "Mediation" "<format>" file with the following claims
      | ucn                  | feeCode |
      | 07081998/S/<format>E | ASSA    |
      | 07081998/S/<format>E | ASST    |
    When I upload the generated file
    Then I should see the submission summary for "Mediation"
    Examples:
      | format |
      | txt    |

  Scenario Outline: Should have no errors in <format> submission (fee code different multiple submissions)
    Given I generate "Mediation" "<format>" file with the following claims
      | ucn                  | feeCode | ufn        | office |
      | 07081996/S/<format>E | ASSA    | 080725/123 | 0P322F  |
    And I upload the generated file
    And click import
    Given I generate "Mediation" "<format>" file with the following claims
      | ucn                  | feeCode | ufn        | office |
      | 07081996/S/<format>E | ASST    | 080725/123 | 0P322F  |
    When I upload the generated file and wait for import in progress
    Then I should see the submission summary for "Mediation"
    Examples:
      | format |
      | csv    |

