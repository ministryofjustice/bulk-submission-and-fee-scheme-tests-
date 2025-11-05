@duplicateChecks
@bulkSubmission
@temp
Feature: Duplicate checks - Mediation

  Background:
    Given I am on the bulk import page

  Scenario Outline: First occurrence is accepted
    When I generate "Mediation" "<format>" file with "2" outcomes
    And I upload the generated file and wait for import in progress
    Then I should see the submission summary for "Mediation" with "2" claims
    Examples:
      | format |
      | csv    |
      | xml    |
      | txt    |

  Scenario Outline: Duplicate detected against a previously submitted claim from <format>
    Given I generate "Mediation" "<format>" file with the following claims
      | ucn             | ufn        |
      | 14091962/T/PERS | 010725/123 |
    And I upload with generated file via the API
    When I upload the generated file and wait for import in progress
    Then I should have duplicate submission error for "0P322F" "Mediation"
      | submission period |
    Examples:
      | format |
      | csv    |
      | xml    |
      | txt    |

  Scenario Outline: Should have no errors in <format> submission (UCN different)
    Given I generate "Mediation" "<format>" file with the following claims
      | ucn                  | feeCode | ufn        |
      | 07081996/S/<format>E | ASSA    | 010725/123 |
      | 07081997/S/<format>E | ASSA    | 010725/123 |
    And I upload with generated file via the API
    When I upload the generated file and wait for import in progress
    Then I should have duplicate submission error for "0P322F" "Mediation"
      | submission period |
    Examples:
      | format |
      | csv    |
      | xml    |
      | txt    |


  Scenario Outline: Not duplicate when previous submission was invalid from <format>
    Given I generate "Mediation" "<format>" file with the following claims
      | ucn             |
      | 14091962/T/PERS |
    And I upload with generated file via the API
    And I make the generated file invalid
    When I upload the generated file and wait for import in progress
    Then I should see the submission summary for "Mediation"
    Examples:
      | format |
      | csv    |
      | xml    |
      | txt    |

  Scenario Outline: Duplicate detected within the same <format> submission file (later row duplicate)
    Given I generate "Mediation" "<format>" file with the following claims
      | feeCode | uniqueCaseId |
      | ASSA    | 020725/123   |
      | ASSA    | 020725/123   |
    And I upload the generated file and wait for import in progress
    Then I should see the following submission error messages for "Mediation":
      | Error Message                                          |
      | A duplicate claim was found within the same submission |
      | A duplicate claim was found within the same submission |
    Examples:
      | format |
      | csv    |
      | xml    |
      | txt    |

  Scenario Outline: Should have no errors in <format> submission (unique case ID different)
    Given I generate "Mediation" "<format>" file with the following claims
      | feeCode | uniqueCaseId    |
      | ASSA    | 030725/<suffix> |
      | ASSA    | 040725/<suffix> |
    When I upload the generated file and wait for import in progress
    Then I should see the submission summary for "Mediation"
    Examples:
      | format | suffix |
      | csv    | 123    |
      | xml    | 456    |
      | txt    | 789    |

  Scenario Outline: Should have no errors in <format> submission (unique case ID different multiple submissions)
    Given I generate "Mediation" "<format>" file with the following claims
      | feeCode | uniqueCaseId    |
      | ASSA    | 060725/<suffix> |
    And I upload with generated file via the API
    Given I generate "Mediation" "<format>" file with the following claims
      | feeCode | uniqueCaseId    |
      | ASSA    | 160725/<suffix> |
    When I upload the generated file and wait for import in progress
    Then I should see the submission summary for "Mediation"
    Examples:
      | format | suffix |
      | csv    | 123    |
      | xml    | 456    |
      | txt    | 789    |

  Scenario Outline: Should have no errors in <format> submission (fee code different)
    Given I generate "Mediation" "<format>" file with the following claims
      | ucn                  | feeCode | ufn        |
      | 07081998/S/<format>E | ASSA    | 070725/123 |
      | 07081998/S/<format>E | ASST    | 070725/123 |
    When I upload the generated file and wait for import in progress
    Then I should see the submission summary for "Mediation"
    Examples:
      | format |
      | csv    |
      | xml    |
      | txt    |


  Scenario Outline: Should have no errors in <format> submission (fee code different multiple submissions)
    Given I generate "Mediation" "<format>" file with the following claims
      | ucn                  | feeCode | ufn        |
      | 07081996/S/<format>E | ASSA    | 080725/123 |
    And I upload with generated file via the API
    Given I generate "Mediation" "<format>" file with the following claims
      | ucn                  | feeCode | ufn        |
      | 07081996/S/<format>E | ASST    | 080725/124 |
    When I upload the generated file and wait for import in progress
    Then I should see the submission summary for "Mediation"
    Examples:
      | format |
      | csv    |
      | xml    |
      | txt    |

