@bulkSubmission @validation @wip
Feature: Invalid submission level validation

  Background:
    Given I start from a clean logged-in state
    Given I am on the bulk import page

  Scenario: Verify all mandatory field errors are displayed for an invalid XML upload Legal Help
    When I upload "tests/data/invalid/Legal_Help_Required_Field_Validation.xml"
    Then I should see an error banner saying "1 claim has errors for missing or incorrect information"
    And I should see the following submission error messages for "LEGAL HELP":
      | Error Message                                            |
      | Unique File Number is required for Legal Help claims     |
      | Client Forename is required for Legal Help claims        |
      | Client Surname is required for Legal Help claims         |
      | Client Postcode is required for Legal Help claims        |
      | Gender Code is required for Legal Help claims            |
      | Ethnicity Code is required for Legal Help claims         |
      | Disability Code is required for Legal Help claims        |
      | Case Reference Number is required for Legal Help claims  |
      | Schedule Reference is required for Legal Help claims     |
      | Case Concluded Date must be between 01/01/1995 and today |

@stable
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
    Client 2 Date of Birth must be between 01/01/1900 and today
    """

  @stable
  Scenario: Reject submission due to period prior to 2015
    When I upload "tests/data/invalid/submissionPeriod.txt"
    Then I should see a submission error message for "<AreaOfLaw>"
    """
    Submissions for periods before JAN-2015 are not accepted. Please submit for a period on or after JAN-2015.
    """

  @stable
  Scenario Outline: Reject submission due to invalid submission periods
    When I stage "tests/data/invalid/submissionPeriod.txt" file for upload
    And I update the SubmissionPeriod to "<periodType>"
    And I upload the generated file
    Then I should see the following submission error messages for the "<errorPlaceholder>"
      | Error Message                                                                                          |
      | Submissions for <errorText> (<errorPlaceholder>) are not accepted. Please submit for a previous month. |

    Examples:
      | periodType   | errorPlaceholder | errorText               |
      | CurrentMonth | CURRENT_MONTH    | the current month       |
      | FutureDate   | CURRENT_MONTH    | after the current month |