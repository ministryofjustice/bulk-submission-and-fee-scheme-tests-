@duplicateChecks
@bulkSubmission
Feature: Duplicate checks - Legal Help

  Background:
    Given I start from a clean logged-in state
    Given I am on the bulk import page

  Scenario Outline: First occurrence is accepted
    When I generate "Legal help" "<format>" file with the following claims
      | feeCode |
      | CAPA    |
      | CAPA    |
    And I upload the generated file and wait for import in progress
    Then I should see the submission summary for "Legal help" with "2" claims
    Examples:
      | format |
      | csv    |
      | xml    |
      | txt    |

  Scenario Outline: Duplicate detected against a previously submitted claim from <format>
    Given I generate "Legal help" "<format>" file with the following claims
      | ucn                  | feeCode | ufn        |
      | 14091962/T/<format>S | CAPA    | 010625/123 |
    And I upload with generated file via the API
    When I upload the generated file and wait for import in progress
    Then I should have duplicate submission error for "0P322F" "Legal help"
      | submissionPeriod |
    Examples:
      | format |
      | csv    |
      | xml    |
      | txt    |

  Scenario Outline: Should have no errors in <format> submission (UCN different)
    Given I generate "Legal help" "<format>" file with the following claims
      | ucn                  | feeCode | ufn        |
      | 07081996/S/<format>E | CAPA    | 010625/123 |
      | 07081997/S/<format>E | CAPA    | 010625/123 |
    And I upload with generated file via the API
    When I upload the generated file and wait for import in progress
    Then I should have duplicate submission error for "0P322F" "Legal help"
    Examples:
      | format |
      | csv    |
      | xml    |
      | txt    |


  Scenario Outline: Not duplicate when previous submission was invalid from <format>
    Given I generate "Legal help" "<format>" file with the following claims
      | ucn                  |
      | 14091962/T/<format>S |
    And I upload with generated file via the API
    And I make the generated file invalid
    When I upload the generated file and wait for import in progress
    Then I should see the submission summary for "Legal help"
    Examples:
      | format |
      | csv    |
      | xml    |
      | txt    |

  Scenario Outline: Duplicate detected within the same <format> submission file (later row duplicate)
    Given I generate "Legal help" "<format>" file with the following claims
      | ucn                  | feeCode | ufn        |
      | 07081996/S/<format>E | CAPA    | 020625/123 |
      | 07081996/S/<format>E | CAPA    | 020625/123 |
    And I upload the generated file and wait for import in progress
    Then I should see the following submission error messages for "Legal help":
      | Error Message                                          |
      | A duplicate claim was found within the same submission |
      | A duplicate claim was found within the same submission |
    Examples:
      | format |
      | csv    |
      | xml    |
      | txt    |

  Scenario Outline: Should have no errors in <format> submission (UFN different)
    Given I generate "Legal help" "<format>" file with the following claims
      | ucn                  | feeCode | ufn        |
      | 07081996/S/<format>E | CAPA    | 030625/123 |
      | 07081996/S/<format>E | CAPA    | 030625/124 |
    When I upload the generated file and wait for import in progress
    Then I should see the submission summary for "Legal help"
    Examples:
      | format |
      | csv    |
      | xml    |
      | txt    |

  Scenario Outline: Should have no errors in <format> submission (UFN different multiple submissions)
    Given I generate "Legal help" "<format>" file with the following claims
      | ucn                  | feeCode | ufn        |
      | 07081996/S/<format>E | CAPA    | 040625/123 |
    And I upload with generated file via the API
    Given I generate "Legal help" "<format>" file with the following claims
      | ucn                  | feeCode | ufn        |
      | 07081996/S/<format>E | CAPA    | 040625/124 |
    When I upload the generated file and wait for import in progress
    Then I should see the submission summary for "Legal help"
    Examples:
      | format |
      | csv    |
      | xml    |
      | txt    |

  Scenario Outline: Should have no errors in <format> submission (UCN different)
    Given I generate "Legal help" "<format>" file with the following claims
      | ucn                  | feeCode | ufn        |
      | 07081996/S/<format>E | CAPA    | 050625/123 |
      | 07081997/S/<format>F | CAPA    | 050625/123 |
    When I upload the generated file and wait for import in progress
    Then I should see the submission summary for "Legal help"
    Examples:
      | format |
      | csv    |
      | xml    |
      | txt    |

  Scenario Outline: Should have no errors in <format> submission (UCN different multiple submissions)
    Given I generate "Legal help" "<format>" file with the following claims
      | ucn                  | feeCode | ufn        |
      | 07081996/S/<format>E | CAPA    | 060625/123 |
    And I upload with generated file via the API
    Given I generate "Legal help" "<format>" file with the following claims
      | ucn                  | feeCode | ufn        |
      | 07081996/S/<format>F | CAPA    | 060625/124 |
    When I upload the generated file and wait for import in progress
    Then I should see the submission summary for "Legal help"
    Examples:
      | format |
      | csv    |
      | xml    |
      | txt    |

  Scenario Outline: Should have no errors in <format> submission (fee code different)
    Given I generate "Legal help" "<format>" file with the following claims
      | ucn                  | feeCode | ufn        |
      | 07081998/S/<format>E | CAPA    | 070725/123 |
      | 07081998/S/<format>E | COM     | 070725/123 |
    When I upload the generated file and wait for import in progress
    Then I should see the submission summary for "Legal help"
    Examples:
      | format |
      | csv    |
      | xml    |
      | txt    |


  Scenario Outline: Should have no errors in <format> submission (feeCode different multiple submissions)
    Given I generate "Legal help" "<format>" file with the following claims
      | ucn                  | feeCode | ufn        |
      | 07081996/S/<format>E | CAPA    | 080625/123 |
    And I upload with generated file via the API
    Given I generate "Legal help" "<format>" file with the following claims
      | ucn                  | feeCode | ufn        |
      | 07081996/S/<format>E | COM     | 080625/124 |
    When I upload the generated file and wait for import in progress
    Then I should see the submission summary for "Legal help"
    Examples:
      | format |
      | csv    |
      | xml    |
      | txt    |

