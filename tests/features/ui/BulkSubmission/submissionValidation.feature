@bulkSubmission
Feature: Invalid submission level validation

  Background:
    Given I am on the bulk import page


  Scenario: Verify all mandatory field errors are displayed for an invalid XML upload Legal Help
    When I upload "tests/data/invalid/Legal_Help_Required_Field_Validation.xml"
    Then I should see an error banner saying "1 claim has errors for missing or incorrect information"
    And I should see the following submission error messages for "Legal Help":
      | Error Message                                                                     |
      | A category of law could not be found for the provided fee code: PPP               |
      | Unique File Number is required for Legal Help claims                              |
      | Client Forename is required for Legal Help claims                                 |
      | Client Surname is required for Legal Help claims                                  |
      | Client Postcode is required for Legal Help claims                                 |
      | Gender Code is required for Legal Help claims                                     |
      | Ethnicity Code is required for Legal Help claims                                  |
      | Disability Code is required for Legal Help claims                                 |
      | Case Reference Number is required for Legal Help claims                           |
      | Schedule Reference is required for Legal Help claims                              |
      | Case Concluded Date must be between 01/01/1995 and today                          |


  Scenario: Invalid Fee code
    When I upload "tests/data/invalid/legal_Invalid_Feecode.txt"
    Then I should see an error banner saying "2 claims have errors for missing or incorrect information"
    And I should see the following submission error messages for "LEGAL HELP":
      | Error Message                                                                       |
      | A category of law could not be found for the provided fee code: lol                 |
      | The provider is not contracted for the category of law associated with the fee code |

  Scenario: Validate multiple paginated claim errors
    When I upload "tests/data/invalid/regexValidation.xml"
    Then I should see an error banner saying "1 claim has errors for missing or incorrect information"
    And I should now see the following detailed submission error messages for "LEGAL HELP":
      """
      Case Reference Number must contain only letters, numbers, forward slashes, periods, hyphens, and spaces, and be a maximum of 30 characters
      Procurement Area Code must be 2 uppercase letters followed by 5 digits
      Client Forename must contain only letters, numbers, spaces, hyphens, apostrophes, ampersands, and be a maximum of 30 characters
      Client Surname must contain only letters, numbers, spaces, hyphens, apostrophes, ampersands, and be a maximum of 30 characters
      Client Postcode must be a valid UK postcode or NFA
      Gender code must be valid
      Ethnicity Code must be valid
      Ethnicity Code must be valid
      Disability Code must be valid
      Case Stage/Level Code must be valid
      Case Stage/Level Code must be valid
      Schedule Reference must be a maximum of 20 characters and contain only letters, numbers, forward slashes, periods, and hyphens
      Unique file ID must be in the format DDMMYY/NNN with a date in the past
      The provider is not contracted for the category of law associated with the fee code
      """

  Scenario: Invalid data submission triggers regex and value validation errors for Mediation
    When I upload "tests/data/invalid/mediationFieldValidation.txt"
    Then I should see an error banner saying "1 claim has errors for missing or incorrect information"
    And I should now see the following detailed submission error messages for "MEDIATION":
      """
      Case Reference Number must contain only letters, numbers, forward slashes, periods, hyphens, and spaces, and be a maximum of 30 characters
      Mediation Sessions Count must be between 1 and 99
      Mediation Time Minutes must be between 0 and 99999
      Client Postcode must be a valid UK postcode or NFA
      Ethnicity Code must be valid
      Disability Code must be valid
      Client 2 Gender code must be valid
      Invalid date value for Client2 Date of Birth (Must be between 1900-01-01 and today): 2050-04-15
      """


  Scenario: Reject submission due to period prior to 2015
    When I upload "tests/data/invalid/submissionPeriod.txt"
    Then I should see a submission error message for "<AreaOfLaw>" saying
    """
    Submissions for periods before JAN-2015 are not accepted. Please submit for a period on or after JAN-2015.
    """


  Scenario Outline: Reject any file submission for submission periods greater than current Month
    Given today's date/time in Europe/London falls in the "<currentMonth>"
    And I generate "Legal help" "<format>" file with the following claims from period "<submissionPeriod>"
      | ucn                  | feeCode | ufn   |
      | 07081999/S/<format>E | CRI123  | <ufn> |
    And I upload the generated file
    Then I should see the following submission error messages for the "CURRENT_MONTH"
      | Error Message                                                                                                      |
      | Submissions for <errorSubText> current month (CURRENT_MONTH) are not accepted. Please submit for a previous month. |
    Examples:
      | format | ufn        | submissionPeriod | currentMonth  | errorSubText |
      | csv    | 060725/123 | month+0          | month+0       | the          |
      | txt    | 060725/122 | month+3          | month+0       | after the    |