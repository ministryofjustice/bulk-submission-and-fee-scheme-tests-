@duplicateChecks @stable
Feature: Duplicate checks - Legal Help - Disbursements

  Background:
    Given I start from a clean logged-in state
    Given I am on the bulk import page

  Scenario Outline: Should accept submission if more than <monthsDifference> months apart
    Given I generate two Legal help files in "<format>" format for office "<office>" that are "<monthsDifference>" months apart with the following claims
      | ucn   | feeCode1 | feeCode2 | ufn   |
      | <ucn> | ICISD    | ICISD    | <ufn> |

    When I upload the first file
    And click import
    When I upload the second file
    Then I should see the submission summary for "Legal help"

    Examples:
      | format | office | ufn        | ucn             | monthsDifference |
      | csv    | 0P322F | 020725/123 | 03021998/S/CSVA | 3                |
      | csv    | 2L849T | 020725/124 | 04021998/S/CSVA | 4                |


  Scenario Outline: Within file duplicates
    Given I generate "Legal help" "<format>" file with the following claims
      | ucn   | feeCode | ufn   |
      | <ucn> | ICISD   | <ufn> |
      | <ucn> | ICISD   | <ufn> |
    When I upload the generated file
    Then I should see the following submission error messages for "Legal help":
      | Error Message                                          |
      | A duplicate claim was found within the same submission |
      | A duplicate claim was found within the same submission |
    Examples:
      | format | ufn        | ucn             |
      | csv    | 010825/123 | 01021998/S/CSVA |


  Scenario Outline: Not duplicate if different ufn
    Given I generate single "Legal help" "<format>" file with the following claims
      | ucn   | feeCode | ufn    | office |
      | <ucn> | ICISD   | <ufn>1 | 1T102C |

    And I upload the generated file
    And click import

    Given I generate single "Legal help" "<format>" file with the following claims
      | ucn   | feeCode | ufn    | office |
      | <ucn> | ICISD   | <ufn>2 | 1T102C |

    When I upload the generated file
    Then I should see the submission summary for "Legal help"

    Examples:
      | format | ufn       | ucn             |
      | csv    | 011025/12 | 01021998/S/CSVA |

  Scenario Outline: Not duplicate if different ucn
    Given I generate single "Legal help" "<format>" file with the following claims
      | ucn    | feeCode | ufn   | office |
      | <ucn>A | ICISD   | <ufn> | 2P747T |

    And I upload the generated file
    And click import

    Given I generate single "Legal help" "<format>" file with the following claims
      | ucn    | feeCode | ufn   | office |
      | <ucn>B | ICISD   | <ufn> | 2P747T |

    When I upload the generated file
    Then I should see the submission summary for "Legal help"

    Examples:
      | format | ufn        | ucn            |
      | csv    | 011025/123 | 01021998/S/CSV |


  Scenario Outline: Not duplicate if different office
    Given I generate single "Legal help" "<format>" file with the following claims
      | ucn   | feeCode | ufn   | office    |
      | <ucn> | ICISD   | <ufn> | <office1> |

    And I upload the generated file
    And click import

    Given I generate single "Legal help" "<format>" file with the following claims
      | ucn   | feeCode | ufn   | office    |
      | <ucn> | ICISD   | <ufn> | <office2> |

    When I upload the generated file
    Then I should see the submission summary for "Legal help"

    Examples:
      | format | office1 | office2 | ufn        | ucn             |
      | csv    | 1T102C  | 0P322F  | 011025/123 | 01021998/S/CSVA |


  @duplicateChecks @stable
  Scenario Outline: Not duplicate if different fee code
    Given I generate two Legal help files in "<format>" format for office "<office>" that are "1" months apart with the following claims
      | ucn   | ufn   | feeCode1 | feeCode2 |
      | <ucn> | <ufn> | ICISD    | ICSSD    |

    When I upload the first file
    And click import
    When I upload the second file
    Then I should see the submission summary for "Legal help"

    Examples:
      | format | office | ufn         | ucn             |
      | csv    | 2P746R | 301025/§123 | 01021998/S/CSVA |


  @duplicateChecks
  Scenario Outline: Period rule – should reject second submission when less than <monthsDifference> months apart
    Given I generate two Legal help files in "<format>" format for office "<office>" that are "<monthsDifference>" months apart with the following claims
      | ucn   | feeCode1  | feeCode2  | ufn   |
      | <ucn> | <feeCode> | <feeCode> | <ufn> |

    When I upload the first file
    And click import
    When I upload the second file
    Then I should see the following submission error messages for "Legal help":
      | Error Message  |
      | <errorMessage> |

    Examples:
      | format | office | ucn             | ufn        | feeCode | monthsDifference | errorMessage                                      |
      | csv    | 2L849T | 03011998/S/CSVA | 010725/323 | ICISD   | 0                | Submission already exists for Office              |
      | csv    | 0P322F | 04011998/S/CSVA | 020825/423 | ICISD   | 1                | A duplicate claim was found in another submission |
      | csv    | 0P322F | 05011998/S/CSVA | 020825/523 | ICISD   | 2                | A duplicate claim was found in another submission |
