@bulkSubmissions
@duplicateChecks
  @temp
Feature: Duplicate checks - Legal Help - Disbursements

  Background:
    Given I am on the bulk import page

  Scenario Outline: Should reject submission if less than 3 months
    Given I generate "Legal help" "<format>" file with the following claims with office "2L849T"
      | ucn   | feeCode | ufn   |
      | <ucn> | ICISD   | <ufn> |
    And I upload with generated file via the API
    And I generate "Legal help" "<format>" file with the following claims with office "2L849T" with a difference of "<monthsDifference>" months from the previous submission
      | ucn   | feeCode | ufn   |
      | <ucn> | ICISD   | <ufn> |
    When I upload the generated file and wait for import in progress
    Then I should see the following submission error messages for "Legal help":
      | Error Message  |
      | <errorMessage> |
    Examples:
      | format | ufn        | ucn             | monthsDifference | errorMessage                                                                      |
      #| csv    | 020825/123 | 01011998/S/CSVA | -2               | A duplicate claim was found in another submission                                          |
      #| csv    | 020825/223 | 02011998/S/CSVA | -1               | A duplicate claim was found in another submission                                          |
      | csv    | 010725/323 | 03011998/S/CSVA | 0                | Submission already exists for Office (2L849T), Area of Law (LEGAL HELP), Period ( |
      | csv    | 020825/423 | 04011998/S/CSVA | 1                | A duplicate claim was found in another submission                                 |
      | csv    | 020825/523 | 05011998/S/CSVA | 2                | A duplicate claim was found in another submission                                 |

  Scenario Outline: Should accept submission if more than 3 months
    Given I generate "Legal help" "<format>" file with the following claims with office "2L849T"
      | ucn   | feeCode | ufn   |
      | <ucn> | ICISD   | <ufn> |
    And I upload with generated file via the API
    And I generate "Legal help" "<format>" file with the following claims with office "2L849T" with a difference of "<monthsDifference>" months from the previous submission
      | ucn   | feeCode | ufn   |
      | <ucn> | ICISD   | <ufn> |
    When I upload the generated file and wait for import in progress
    Then I should see the submission summary for "Legal help"
    Examples:
      | format | ufn        | ucn             | monthsDifference |
      # New submission for period earlier than original submission by 3 months  (Waiting on BC-230)
      #                 | csv    | 020725/121 | 01021998/S/CSVA | FEB-2022         |
      # New submission for period earlier than original submission by 5 months  (Waiting on BC-230)
      #                | csv    | 020725/122 | 02021998/S/CSVA | JAN-2022         |
      # New submission for period later than original submission by 3 months
      | csv    | 020725/123 | 03021998/S/CSVA | 3                |
      # New submission for period earlier than original submission by 4 months
      | csv    | 020725/124 | 04021998/S/CSVA | 4                |

  Scenario Outline: Within file duplicates
    Given I generate "Legal help" "<format>" file with the following claims with office "1T102C"
      | ucn   | feeCode | ufn   |
      | <ucn> | ICISD   | <ufn> |
      | <ucn> | ICISD   | <ufn> |
    When I upload the generated file and wait for import in progress
    Then I should see the following submission error messages for "Legal help":
      | Error Message                                          |
      | A duplicate claim was found within the same submission |
      | A duplicate claim was found within the same submission |
    Examples:
      | format | ufn        | ucn             |
      | csv    | 010825/123 | 01021998/S/CSVA |

  Scenario Outline: Not duplicate if different ufn
    Given I generate "Legal help" "<format>" file with the following claims with office "1T102C"
      | ucn   | feeCode | ufn    |
      | <ucn> | ICISD   | <ufn>1 |
    And I upload with generated file via the API
    And I generate "Legal help" "<format>" file with the following claims with office "1T102C" with a difference of "1" months from the previous submission
      | ucn   | feeCode | ufn    |
      | <ucn> | ICISD   | <ufn>2 |
    When I upload the generated file and wait for import in progress
    Then I should see the submission summary for "Legal help"
    Examples:
      | format | ufn       | ucn             |
      | csv    | 011025/12 | 01021998/S/CSVA |

  Scenario Outline: Not duplicate if different ucn
    Given I generate "Legal help" "<format>" file with the following claims with office "2P747T"
      | ucn    | feeCode | ufn   |
      | <ucn>A | ICISD   | <ufn> |
    And I upload with generated file via the API
    And I generate "Legal help" "<format>" file with the following claims with office "2P747T" with a difference of "1" months from the previous submission
      | ucn    | feeCode | ufn   |
      | <ucn>B | ICISD   | <ufn> |
    When I upload the generated file and wait for import in progress
    Then I should see the submission summary for "Legal help"
    Examples:
      | format | ufn        | ucn            |
      | csv    | 011025/123 | 01021998/S/CSV |

  Scenario Outline: Not duplicate if different office
    Given I generate "Legal help" "<format>" file with the following claims with office "1T102C"
      | ucn    | feeCode | ufn   |
      | <ucn> | ICISD   | <ufn> |
    And I upload with generated file via the API
    And I generate "Legal help" "<format>" file with the following claims with office "0P322F" with a difference of "0" months from the previous submission
      | ucn    | feeCode | ufn   |
      | <ucn> | ICISD   | <ufn> |
    When I upload the generated file and wait for import in progress
    Then I should see the submission summary for "Legal help"
    Examples:
      | format | ufn        | ucn             |
      | csv    | 011025/123 | 01021998/S/CSVA |

  Scenario Outline: Not duplicate if different fee code
    Given I generate "Legal help" "<format>" file with the following claims with office "2P746R"
      | ucn   | feeCode | ufn   |
      | <ucn> | ICISD   | <ufn> |
    And I upload with generated file via the API
    And I generate "Legal help" "<format>" file with the following claims with office "2P746R" with a difference of "1" months from the previous submission
      | ucn   | feeCode | ufn   |
      | <ucn> | ICSSD   | <ufn> |
    When I upload the generated file and wait for import in progress
    Then I should see the submission summary for "Legal help"
    Examples:
      | format | ufn        | ucn             |
      | csv    | 301025/123 | 01021998/S/CSVA |



