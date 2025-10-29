@bulkSubmission
Feature: Invalid submission level validation

  Background:
    Given I am on the bulk import page

  Scenario: Verify all mandatory field errors are displayed for an invalid XML upload Legal Help
    When I upload "tests/data/invalid/Legal_Help_Required_Field_Validation.xml"
    Then I should see an error banner saying "1 claim has errors for missing or incorrect information"
    And I should see the following submission error messages for "LEGAL HELP":
      | Error Message                                                                                 |
      | uniqueFileNumber is required for area of law: LEGAL HELP                                      |
      | clientForename is required for area of law: LEGAL HELP                                        |
      | clientSurname is required for area of law: LEGAL HELP                                         |
      | clientPostcode is required for area of law: LEGAL HELP                                        |
      | genderCode is required for area of law: LEGAL HELP                                            |
      | ethnicityCode is required for area of law: LEGAL HELP                                         |
      | disabilityCode is required for area of law: LEGAL HELP                                        |
      | caseReferenceNumber is required for area of law: LEGAL HELP                                   |
      | scheduleReference is required for area of law: LEGAL HELP                                     |
      | Invalid date value for Case Concluded Date (Must be between 1995-01-01 and today): 2058-09-02 |


  Scenario: Invalid Fee code
    When I upload "tests/data/invalid/legal_Invalid_Feecode.txt"
    Then I should see an error banner saying "2 claims have errors for missing or incorrect information"
    And I should see the following submission error messages for "LEGAL HELP":
      | Error Message                                                                       |
      | A category of law could not be found for the provided fee code: lol                 |
      | The provider is not contracted for the category of law associated with the fee code |


  Scenario: Invalid Area of Law
    When I upload "tests/data/invalid/invalidAreaOfLaw.csv"
    Then I should see an error banner saying "1 error was found with your submission"
    And I should see the following submission error messages for "LEGAL HELP":
      | Error Message                                                                                                                                |
      | area_of_law: does not have a value in the enumeration ["CIVIL", "CRIME", "MEDIATION", "CRIME LOWER", "LEGAL HELP"] (provided value: Invalid) |


  Scenario: Validate multiple paginated claim errors
    When I upload "tests/data/invalid/regexValidation.xml"
    Then I should see an error banner saying "1 claim has errors for missing or incorrect information"
    And I should now see the following detailed submission error messages for "LEGAL HELP":
      """
      case_reference_number: does not match the regex pattern ^[a-zA-Z0-9/.\-\s]+$ (provided value: @)
      procurement_area_code: does not match the regex pattern ^[A-Z]{2}[0-9]{5}$ (provided value: .)
      client_forename: does not match the regex pattern ^[\p{L}\p{N}\p{Zs}\-’'&]{1,30}$ (provided value: @)
      client_surname: does not match the regex pattern ^[\p{L}\p{N}\p{Zs}\-’'&]{1,30}$ (provided value: @)
      client_postcode: does not match the regex pattern ^NFA|[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$ (provided value: ju)
      gender_code: does not match the regex pattern ^([MFU])$ (provided value: J)
      ethnicity_code: does not match the regex pattern ^(0[0-9]|1[0-6]|99)$ (provided value: J)
      ethnicity_code: must be at least 2 characters long (provided value: J)
      disability_code: does not match the regex pattern ^(NCD|MOB|DEA|HEA|VIS|BLI|MHC|LDD|COG|ILL|OTH|UKN|PHY|SEN)$ (provided value: lpo)
      case_stage_code: does not match the regex pattern ^(FPL(0[1-9]|1[0-9]|20|21)|FPC0[1-3]|MHL(0[1-9]|10))$ (provided value: 89)
      case_stage_code: must be at least 5 characters long (provided value: 89)
      Unique file ID must be in the format DDMMYY/NNN with a date in the past
      The provider is not contracted for the category of law associated with the fee code
      """

  Scenario: Invalid data submission triggers regex and value validation errors for Mediation
    When I upload "tests/data/invalid/mediationFieldValidation.txt"
    Then I should see an error banner saying "1 claim has errors for missing or incorrect information"
    And I should now see the following detailed submission error messages for "MEDIATION":
      """
      case_reference_number: does not match the regex pattern ^[a-zA-Z0-9/.\-\s]+$ (provided value: @@9143)
      mediation_sessions_count: must have a maximum value of 99 (provided value: 999)
      mediation_time_minutes: must have a minimum value of 0 (provided value: -10)
      client_postcode: does not match the regex pattern ^NFA|[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$ (provided value: INVALID)
      ethnicity_code: does not match the regex pattern ^(0[0-9]|1[0-6]|99)$ (provided value: ZZ)
      disability_code: does not match the regex pattern ^(NCD|MOB|DEA|HEA|VIS|BLI|MHC|LDD|COG|ILL|OTH|UKN|PHY|SEN)$ (provided value: FOO)
      client_2_gender_code: does not match the regex pattern ^([MFU])$ (provided value: X)
      Invalid date value for Client2 Date of Birth (Must be between 1900-01-01 and today): 2050-04-15
      """


  Scenario: Reject submission due to period prior to 2015
    When I upload "tests/data/invalid/submissionPeriod.txt"
    Then I should see a submission error message for "<AreaOfLaw>" saying
    """
    Submissions for periods before JAN-2015 are not accepted. Please submit for a period on or after JAN-2015.
    """