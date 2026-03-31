@stable @claimValidation @validationChecks
Feature: Display message checks

  Background:
    Given I am on the bulk import page

  Scenario: Invalid Fee code
    When I upload "tests/data/invalid/legal_Invalid_Feecode.txt"
    And I wait on validation in progress screen
    Then I should see an error banner saying "2 claims have errors for missing or incorrect information"
    And I should see the following submission error messages for "LEGAL HELP":
      | Error Message                                                                       |
      | A category of law could not be found for the provided fee code: lol                 |
      | The provider is not contracted for the category of law associated with the fee code |

  @smoke
  Scenario: Legal Help: Should check display messages are shown for missing field based errors
    Given I upload "tests/data/invalid/legal_help_missing_fields.csv"
    And I wait on validation in progress screen
    When I should see an error banner saying "1 claim has errors for missing or incorrect information"
    And I should see the following submission error messages for "LEGAL HELP":
      | Error Message                                                 |
      | Net Disbursement Amount is required                           |
      | Disbursements Vat Amount is required                          |
      | Unique File Number is required for Legal Help claims          |
      | Case Start Date is required for Legal Help claims             |
      | Case Concluded Date is required for Legal Help claims         |
      | Outcome Code is required for Legal Help claims                |
      | Travel Waiting Costs Amount is required for Legal Help claims |
      | Client Forename is required for Legal Help claims             |
      | Client Surname is required for Legal Help claims              |
      | Client Date of Birth is required for Legal Help claims        |
      | Unique Client Number is required for Legal Help claims        |
      | Client Postcode is required for Legal Help claims             |
      | Gender Code is required for Legal Help claims                 |
      | Ethnicity Code is required for Legal Help claims              |
      | Disability Code is required for Legal Help claims             |
      | Advice Time is required for Legal Help claims                 |
      | Travel Time is required for Legal Help claims                 |
      | Waiting Time is required for Legal Help claims                |
      | Net Counsel Costs Amount is required for Legal Help claims    |
      | Case Id is required for Legal Help claims                     |
      | Case Reference Number is required for Legal Help claims       |
      | Schedule Reference is required for Legal Help claims          |
      | Net Profit Costs Amount is required for Legal Help claims     |

  Scenario: Legal Help: Should check display messages are shown for out of bound dates with concluded date before 01/04/2013
    Given I generate "Legal help" "csv" file with the following claims
      | caseStartDate | workConcludedDate | transferDate | repOrderDate | clientDob  |
      | 31/12/1994    | 31/03/2013        | 31/12/1994   | 31/03/2016   | 05/01/1899 |
    And I upload the generated file
    When I should see an error banner saying "1 claim has errors for missing or incorrect information"
    And I should see the following submission error messages for "LEGAL HELP":
      | Error Message                                                  |
      | Case Start Date must be between 01/01/1995 and today           |
      | Case Concluded Date cannot be before 01/04/2013                |
      | Transfer Date must be between 01/01/1995 and today             |
      | Representation Order Date must be between 01/04/2016 and today |
      | Client Date of Birth must be between 01/01/1900 and today      |

  Scenario: Legal Help: Should check display messages are shown for out of bound dates with concluded date after the 20th of the month following the submission period
    Given I generate "Legal help" "csv" file with the following claims
      | caseStartDate | workConcludedDate | transferDate | repOrderDate | clientDob  |
      | 31/12/1994    | later             | 31/12/1994   | 31/03/2016   | 05/01/1899 |
    And I upload the generated file
    When I should see an error banner saying "1 claim has errors for missing or incorrect information"
    And I should see the following submission error messages for "LEGAL HELP":
      | Error Message                                                                                  |
      | Case Start Date must be between 01/01/1995 and today                                           |
      | Case Concluded Date cannot be later than the 20th of the month following the submission period |
      | Transfer Date must be between 01/01/1995 and today                                             |
      | Representation Order Date must be between 01/04/2016 and today                                 |
      | Client Date of Birth must be between 01/01/1900 and today                                      |

  Scenario: Legal Help: Should check display messages are shown for out of bound dates with concluded date in the future
    Given I generate "Legal help" "csv" file with the following claims
      | caseStartDate | workConcludedDate | transferDate | repOrderDate | clientDob  |
      | 31/12/1994    | 31/03/2099        | 31/12/1994   | 31/03/2016   | 05/01/1899 |
    And I upload the generated file
    When I should see an error banner saying "1 claim has errors for missing or incorrect information"
    And I should see the following submission error messages for "LEGAL HELP":
      | Error Message                                                  |
      | Case Start Date must be between 01/01/1995 and today           |
      | Case Concluded Date cannot be a future date                    |
      | Transfer Date must be between 01/01/1995 and today             |
      | Representation Order Date must be between 01/04/2016 and today |
      | Client Date of Birth must be between 01/01/1900 and today      |

  Scenario Outline: Legal Help: Should check parse errors for <fieldName>
    Given I generate "Legal help" "csv" file with the following claims
      | <fieldName> |
      | <value>     |
    When I upload that file
    Then the user sees an error message "<errorMessage>"

    Examples:
      | fieldName               | value | errorMessage                                                       |
      | vatApplicable           | A     | VAT Applicable must only include Y or N                            |
      | postalApplication       | A     | Postal Application Accepted must only include Y or N               |
      | nrmAdvice               | A     | NRM Advice must only include Y or N                                |
      | legacyCase              | A     | Legacy Case must only include Y or N                               |
      | londonNonLondonRate     | A     | London Rate must only include Y or N                               |
      | additionalTravelPayment | A     | Additional Travel Payment must only include Y or N                 |
      | eligibleClientIndicator | A     | Eligible Client must only include Y or N                           |
      | ircSurgery              | A     | IRC Surgery must only include Y or N                               |
      | substantiveHearing      | A     | Substantive Hearing must only include Y or N                       |
      | toleranceIndicator      | A     | Tolerance Applicable must only include Y or N                      |
      | caseStartDate           | abc   | Case Start Date must be a valid date in the format DD/MM/YYYY      |
      | workConcludedDate       | abc   | Work Concluded Date must be a valid date in the format DD/MM/YYYY  |
      | clientDateOfBirth       | abc   | Client Date of Birth must be a valid date in the format DD/MM/YYYY |
      | transferDate            | abc   | Transfer Date must be a valid date in the format DD/MM/YYYY        |
      | surgeryDate             | abc   | Surgery Date must be a valid date in the format DD/MM/YYYY         |

  Scenario: Legal Help: Should check display messages are shown for format based errors (regex)
    Given I upload "tests/data/invalid/legal_help_regex_errors.csv"
    And I wait on validation in progress screen
    When I should see an error banner saying "1 claim has errors for missing or incorrect information"
    And I should see the following submission error messages for "LEGAL HELP":
      | Error Message                                                                                                                              |
      | Schedule Reference must be a maximum of 20 characters and contain only letters, numbers, forward slashes, periods, and hyphens             |
      | Case Reference Number must contain only letters, numbers, forward slashes, periods, hyphens, and spaces, and be a maximum of 30 characters |
      | Each Matter Type Code 1 and 2 must be 4 characters                                                                                         |
      | Fee Code must contain only letters and numbers, and be a maximum of 10 characters                                                          |
      | Procurement Area Code must be 2 uppercase letters followed by 5 digits                                                                     |
      | Access Point Code must be in the format AP##### (AP followed by 5 digits)                                                                  |
      | Client Forename must contain only letters, numbers, spaces, hyphens, apostrophes, ampersands, and be a maximum of 30 characters            |
      | Client Surname must contain only letters, numbers, spaces, hyphens, apostrophes, ampersands, and be a maximum of 30 characters             |
      | Unique Client Number must be in the format DDMMYYYY/X/ZZZZ with valid date, and be a maximum of 15 characters                              |
      | Client Postcode must be a valid UK postcode or NFA                                                                                         |
      | Gender code must be valid                                                                                                                  |
      | Ethnicity Code must be valid                                                                                                               |
      | Disability Code must be valid                                                                                                              |
      | Case ID must be exactly 3 digits                                                                                                           |
      | Case Stage/Level Code must be valid                                                                                                        |
      | Stage Reached Code must be exactly 2 alphanumeric characters for Legal Help claims                                                         |
      | Standard Fee Category Code must be valid                                                                                                   |
      | Outcome Code must be exactly 2 characters and contain only letters, numbers, and hyphens                                                   |
      | Designated Accredited Representative Code must be a number from 1 to 5                                                                     |
      | Mental Health Tribunal Reference must be in format AA/NNNN/NNNNN (English) or AANNNNN (Welsh)                                              |
      | Exemption Criteria Satisfied must be 2 uppercase letters followed by 3 digits                                                              |
      | Exceptional Case Funding Reference must be 7 digits followed by 2 uppercase letters                                                        |
      | Advice Time must be a number                                                                                                               |
      | Travel Time must be a number                                                                                                               |
      | Waiting Time must be a number                                                                                                              |
      | Net Profit Costs Amount must be a number with no more than 2 decimal places                                                                |
      | Net Disbursement Amount must be a valid monetary value                                                                                     |
      | Net Counsel Costs Amount must be a valid monetary value                                                                                    |
      | Disbursements VAT Amount must be a valid monetary value                                                                                    |
      | Travel Waiting Costs Amount must be a valid monetary value                                                                                 |
      | Prior Authority Reference must be exactly 7 alphanumeric characters                                                                        |
      | Adjourned Hearing Fee Amount must be a number from 0 to 9                                                                                  |
      | Costs Damages Recovered Amount must be a valid monetary value                                                                              |
      | Meetings Attended Code must be valid                                                                                                       |
      | JR Form Filling Amount must be a valid monetary value                                                                                      |
      | Advice Type Code must be valid                                                                                                             |
      | Medical Reports Count must be 20 or less                                                                                                   |
      | Surgery Clients Count must be between 1 and 20                                                                                             |
      | Surgery Matters Count must be between 1 and 20                                                                                             |
      | CMRH Oral Count must be between 0 and 9                                                                                                    |
      | CMRH Telephone Count must be between 0 and 9                                                                                               |
      | AIT Hearing Centre Code must be valid                                                                                                      |
      | HO Interview must be between 0 and 9                                                                                                       |
      | Local Authority Number must contain only letters and numbers, and be a maximum of 30 characters                                            |
#      | Detention Travel Waiting Costs Amount must be a valid monetary value                                                                       |

  Scenario: Crime Lower: Should check display messages are shown for missing field based errors
    Given I upload "tests/data/invalid/crime_lower_missing_fields.csv"
    And I wait on validation in progress screen
    When I should see an error banner saying "1 claim has errors for missing or incorrect information"
    And I should see the following submission error messages for "CRIME LOWER":
      | Error Message                                              |
      | Net Disbursement Amount is required                        |
      | Disbursements Vat Amount is required                       |
      | Case Concluded Date is required for Crime Lower claims     |
      | Net Profit Costs Amount is required for Crime Lower claims |


  Scenario: Crime Lower: Should check display messages are shown for out of bound dates with concluded date before 01/04/2016
    Given I upload "tests/data/invalid/crime_lower_wrong_dates_with_concluded_date_before_01_04_2016.csv"
    And I wait on validation in progress screen
    When I should see an error banner saying "1 claim has errors for missing or incorrect information"
    And I should see the following submission error messages for "CRIME LOWER":
      | Error Message                                                  |
      | Case Start Date must be between 01/01/1995 and today           |
      | Case Concluded Date cannot be before 01/04/2016                |
      | Transfer Date must be between 01/01/1995 and today             |
      | Representation Order Date must be between 01/04/2016 and today |
      | Client Date of Birth must be between 01/01/1900 and today      |

  Scenario: Crime Lower: Should check display messages are shown for out of bound dates with concluded date after the 20th of the month following the submission period
    Given I upload "tests/data/invalid/crime_lower_wrong_dates_with_concluded_date_after_20th_of_month_following_submission_period.csv"
    And I wait on validation in progress screen
    When I should see an error banner saying "1 claim has errors for missing or incorrect information"
    And I should see the following submission error messages for "CRIME LOWER":
      | Error Message                                                                                  |
      | Case Start Date must be between 01/01/1995 and today                                           |
      | Case Concluded Date cannot be later than the 20th of the month following the submission period |
      | Transfer Date must be between 01/01/1995 and today                                             |
      | Representation Order Date must be between 01/04/2016 and today                                 |
      | Client Date of Birth must be between 01/01/1900 and today                                      |


  Scenario: Crime Lower: Should check display messages are shown for out of bound dates with concluded date in the future
    Given I upload "tests/data/invalid/crime_lower_wrong_dates_with_concluded_date_in_the_future.csv"
    And I wait on validation in progress screen
    When I should see an error banner saying "1 claim has errors for missing or incorrect information"
    And I should see the following submission error messages for "CRIME LOWER":
      | Error Message                                                  |
      | Case Start Date must be between 01/01/1995 and today           |
      | Case Concluded Date cannot be a future date                    |
      | Transfer Date must be between 01/01/1995 and today             |
      | Representation Order Date must be between 01/04/2016 and today |
      | Client Date of Birth must be between 01/01/1900 and today      |


  Scenario Outline: Crime Lower: Should check parse errors for <fieldName>
    Given I generate "Crime lower" "csv" file with the following claims
      | <fieldName> |
      | <value>     |
    When I upload that file
    Then the user sees an error message "<errorMessage>"

    Examples:
      | fieldName               | value | errorMessage                                                       |
      | caseStartDate           | abc   | Case Start Date must be a valid date in the format DD/MM/YYYY      |
      | workConcludedDate       | abc   | Work Concluded Date must be a valid date in the format DD/MM/YYYY  |
      | repOrderDate            | abc   | Rep Order Date must be a valid date in the format DD/MM/YYYY       |
      | clientDateOfBirth       | abc   | Client Date of Birth must be a valid date in the format DD/MM/YYYY |
      | transferDate            | abc   | Transfer Date must be a valid date in the format DD/MM/YYYY        |
      | surgeryDate             | abc   | Surgery Date must be a valid date in the format DD/MM/YYYY         |
      | vatApplicable           | A     | VAT Applicable must only include Y or N                            |
      | postalApplication       | A     | Postal Application Accepted must only include Y or N               |
      | nrmAdvice               | A     | NRM Advice must only include Y or N                                |
      | legacyCase              | A     | Legacy Case must only include Y or N                               |
      | londonNonLondonRate     | A     | London Rate must only include Y or N                               |
      | additionalTravelPayment | A     | Additional Travel Payment must only include Y or N                 |
      | eligibleClientIndicator | A     | Eligible Client must only include Y or N                           |
      | ircSurgery              | A     | IRC Surgery must only include Y or N                               |
      | substantiveHearing      | A     | Substantive Hearing must only include Y or N                       |
      | toleranceIndicator      | A     | Tolerance Applicable must only include Y or N                      |
      | dutySolicitor           | A     | Duty Solicitor must only include Y or N                            |
      | youthCourt              | A     | Youth Court must only include Y or N                               |
      | clientLegallyAided      | A     | Is Legally Aided must only include Y or N                          |

  @smoke
  Scenario: Crime Lower: Should check display messages are shown for format based errors (regex)
    Given I upload "tests/data/invalid/crime_lower_regex_errors.csv"
    And I wait on validation in progress screen
    When I should see an error banner saying "1 claim has errors for missing or incorrect information"
    And I should see the following submission error messages for "CRIME LOWER":
      | Error Message                                                                                                                              |
      | Case Reference Number must contain only letters, numbers, forward slashes, periods, hyphens, and spaces, and be a maximum of 30 characters |
      | Crime Lower Matter Type Code must be one of the permitted values. Please refer to the guidance.                                            |
      | Fee Code must contain only letters and numbers, and be a maximum of 10 characters                                                          |
      | Procurement Area Code must be 2 uppercase letters followed by 5 digits                                                                     |
      | Access Point Code must be in the format AP##### (AP followed by 5 digits)                                                                  |
      | Delivery Location must be 2 uppercase letters followed by 5 digits                                                                         |
      | Suspects Defendants Count must be less than 100                                                                                            |
      | Police Station Court Attendances Count must be between 0 and 99                                                                            |
      | Police Station Court Prison ID must be 1–6 alphanumeric characters and contain at least one letter                                         |
      | DSCC Number must be exactly 10 alphanumeric characters                                                                                     |
      | MAAT ID must be up to 10 alphanumeric characters                                                                                           |
      | Scheme ID must be exactly 4 alphanumeric characters                                                                                        |
      | Mediation Sessions Count must be less than 100                                                                                             |
      | Mediation Time Minutes must be 99999 or less                                                                                               |
      | Outreach Location must be exactly 3 alphanumeric characters                                                                                |
      | Referral Source must be a valid 2-digit code (02-11)                                                                                       |
      | Client Forename must contain only letters, numbers, spaces, hyphens, apostrophes, ampersands, and be a maximum of 30 characters            |
      | Client Surname must contain only letters, numbers, spaces, hyphens, apostrophes, ampersands, and be a maximum of 30 characters             |
      | Unique Client Number must be in the format DDMMYYYY/X/ZZZZ with valid date, and be a maximum of 15 characters                              |
      | Client Postcode must be a valid UK postcode or NFA                                                                                         |
      | Gender code must be valid                                                                                                                  |
      | Ethnicity Code must be valid                                                                                                               |
      | Disability Code must be valid                                                                                                              |
      | Client Type Code must be valid                                                                                                             |
      | Home Office Client Number must contain only letters and numbers, and be a maximum of 16 characters                                         |
      | CLA Reference Number must be between 1 and 7 digits                                                                                        |
      | CLA Exemption Code must be exactly 4 characters                                                                                            |
      | Case ID must be exactly 3 digits                                                                                                           |
      | Case Stage/Level Code must be valid                                                                                                        |
      | Stage Reached Code must be exactly 4 uppercase letters for Crime Lower claims                                                              |
      | Standard Fee Category Code must be valid                                                                                                   |
      | Outcome Code must be a valid crime lower outcome code or left blank                                                                        |
      | Designated Accredited Representative Code must be a number from 1 to 5                                                                     |
      | Mental Health Tribunal Reference must be in format AA/NNNN/NNNNN (English) or AANNNNN (Welsh)                                              |
      | Exemption Criteria Satisfied must be 2 uppercase letters followed by 3 digits                                                              |
      | Exceptional Case Funding Reference must be 7 digits followed by 2 uppercase letters                                                        |
      | Advice Time must be a number                                                                                                               |
      | Travel Time must be a number                                                                                                               |
      | Waiting Time must be a number                                                                                                              |
      | Net Profit Costs Amount must be a number with no more than 2 decimal places                                                                |
      | Net Disbursement Amount must be a valid monetary value                                                                                     |
      | Net Counsel Costs Amount must be a valid monetary value                                                                                    |
      | Disbursements VAT Amount must be a valid monetary value                                                                                    |
      | Net Waiting Costs Amount must be a valid monetary value                                                                                    |
      | Prior Authority Reference must be exactly 7 alphanumeric characters                                                                        |
      | Adjourned Hearing Fee Amount must be a number from 0 to 9                                                                                  |
      | Meetings Attended Code must be valid                                                                                                       |
      | Detention Travel Waiting Costs Amount must be a valid monetary value                                                                       |
      | JR Form Filling Amount must be a valid monetary value                                                                                      |
      | Advice Type Code must be valid                                                                                                             |
      | Medical Reports Count must be 20 or less                                                                                                   |
      | Surgery Matters Count must be between 1 and 20                                                                                             |
      | CMRH Oral Count must be between 0 and 9                                                                                                    |
      | CMRH Telephone Count must be between 0 and 9                                                                                               |
      | AIT Hearing Centre Code must be valid                                                                                                      |
      | HO Interview must be between 0 and 9                                                                                                       |
      | Local Authority Number must contain only letters and numbers, and be a maximum of 30 characters                                            |

  @smoke
  Scenario: Mediation: Should check display messages are shown for missing field based errors
    Given I upload "tests/data/invalid/mediation_missing_fields.csv"
    And I wait on validation in progress screen
    When I should see an error banner saying "1 claim has errors for missing or incorrect information"
    And I should see the following submission error messages for "MEDIATION":
      | Error Message                                          |
      | Net Disbursement Amount is required                    |
      | Disbursements Vat Amount is required                   |
      | Outreach Location is required for Mediation claims     |
      | Referral Source is required for Mediation claims       |
      | Client Forename is required for Mediation claims       |
      | Client Surname is required for Mediation claims        |
      | Client Date of Birth is required for Mediation claims  |
      | Unique Client Number is required for Mediation claims  |
      | Client Postcode is required for Mediation claims       |
      | Unique Case Id is required for Mediation claims        |
      | Schedule Reference is required for Mediation claims    |
      | Case Reference Number is required for Mediation claims |
      | Case Start Date is required for Mediation claims       |
      | Case Id is required for Mediation claims               |
      | Is Legally Aided is required for Mediation claims      |
      | Disability Code is required for Mediation claims       |
      | Ethnicity Code is required for Mediation claims        |
      | Gender Code is required for Mediation claims           |

  Scenario: Mediation: Should check display messages are shown for out of bound dates with concluded date before 01/04/2013
    Given I upload "tests/data/invalid/mediation_wrong_dates_with_concluded_date_before_01_04_2013.csv"
    And I wait on validation in progress screen
    When I should see an error banner saying "1 claim has errors for missing or incorrect information"
    And I should see the following submission error messages for "MEDIATION":
      | Error Message                                               |
      | Case Start Date must be between 01/01/1995 and today        |
      | Case Concluded Date cannot be before 01/04/2013             |
      | Client Date of Birth must be between 01/01/1900 and today   |
      | Client 2 Date of Birth must be between 01/01/1900 and today |

  Scenario: Mediation: Should check display messages are shown for out of bound dates with concluded date after the 20th of the month following the submission period
    Given I upload "tests/data/invalid/mediation_wrong_dates_with_concluded_date_after_20th_of_month_following_submission_period.csv"
    And I wait on validation in progress screen
    When I should see an error banner saying "1 claim has errors for missing or incorrect information"
    And I should see the following submission error messages for "MEDIATION":
      | Error Message                                                                                  |
      | Case Start Date must be between 01/01/1995 and today                                           |
      | Case Concluded Date cannot be later than the 20th of the month following the submission period |
      | Client Date of Birth must be between 01/01/1900 and today                                      |
      | Client 2 Date of Birth must be between 01/01/1900 and today                                    |

  Scenario: Mediation: Should check display messages are shown for out of bound dates with concluded date in the future
    Given I upload "tests/data/invalid/mediation_wrong_dates_with_concluded_date_in_the_future.csv"
    And I wait on validation in progress screen
    When I should see an error banner saying "1 claim has errors for missing or incorrect information"
    And I should see the following submission error messages for "MEDIATION":
      | Error Message                                               |
      | Case Start Date must be between 01/01/1995 and today        |
      | Case Concluded Date cannot be a future date                 |
      | Client Date of Birth must be between 01/01/1900 and today   |
      | Client 2 Date of Birth must be between 01/01/1900 and today |

  Scenario Outline: Mediation: Should check parse errors for <fieldName>
    Given I generate "Mediation" "csv" file with the following claims
      | <fieldName> |
      | <value>     |
    When I upload that file
    Then the user sees an error message "<errorMessage>"

    Examples:
      | fieldName                | value | errorMessage                                                         |
      | caseStartDate            | abc   | Case Start Date must be a valid date in the format DD/MM/YYYY        |
      | medConcludedDate         | abc   | Med Concluded Date must be a valid date in the format DD/MM/YYYY     |
      | workConcludedDate        | abc   | Work Concluded Date must be a valid date in the format DD/MM/YYYY    |
      | clientDateOfBirth        | abc   | Client Date of Birth must be a valid date in the format DD/MM/YYYY   |
      | client2DateOfBirth       | abc   | Client 2 Date of Birth must be a valid date in the format DD/MM/YYYY |
      | vatApplicable            | A     | VAT Applicable must only include Y or N                              |
      | postalApplication        | A     | Postal Application Accepted must only include Y or N                 |
      | client2PostalApplication | A     | Client 2 Postal Application Accepted must only include Y or N        |
      | nrmAdvice                | A     | NRM Advice must only include Y or N                                  |
      | legacyCase               | A     | Legacy Case must only include Y or N                                 |
      | londonNonLondonRate      | A     | London Rate must only include Y or N                                 |
      | additionalTravelPayment  | A     | Additional Travel Payment must only include Y or N                   |
      | eligibleClientIndicator  | A     | Eligible Client must only include Y or N                             |
      | ircSurgery               | A     | IRC Surgery must only include Y or N                                 |
      | substantiveHearing       | A     | Substantive Hearing must only include Y or N                         |
      | toleranceIndicator       | A     | Tolerance Applicable must only include Y or N                        |
      | dutySolicitor            | A     | Duty Solicitor must only include Y or N                              |
      | youthCourt               | A     | Youth Court must only include Y or N                                 |
      | clientLegallyAided       | A     | Is Legally Aided must only include Y or N                            |
      | client2LegallyAided      | A     | Client 2 Legally Aided must only include Y or N                      |

  Scenario: Mediation: Should check display messages are shown for format based errors (regex)
    Given I upload "tests/data/invalid/mediation_regex_errors.csv"
    And I wait on validation in progress screen
    When I should see an error banner saying "1 claim has errors for missing or incorrect information"
    And I should see the following submission error messages for "MEDIATION":
      | Error Message                                                                                                                              |
      | Case Reference Number must contain only letters, numbers, forward slashes, periods, hyphens, and spaces, and be a maximum of 30 characters |
      | Unique Client Number must be in the format DDMMYYYY/X/ZZZZ with valid date, and be a maximum of 15 characters                              |
      | Each Matter Type Code 1 and 2 must be 4 uppercase characters                                                                               |
      | Fee Code must contain only letters and numbers, and be a maximum of 10 characters                                                          |
      | Procurement Area Code must be 2 uppercase letters followed by 5 digits                                                                     |
      | Access Point Code must be in the format AP##### (AP followed by 5 digits)                                                                  |
      | Client Forename must contain only letters, numbers, spaces, hyphens, apostrophes, ampersands, and be a maximum of 30 characters            |
      | Client Surname must contain only letters, numbers, spaces, hyphens, apostrophes, ampersands, and be a maximum of 30 characters             |
      | Client Postcode must be a valid UK postcode or NFA                                                                                         |
      | Gender code must be valid                                                                                                                  |
      | Ethnicity Code must be valid                                                                                                               |
      | Disability Code must be valid                                                                                                              |
      | Case ID must be exactly 3 digits                                                                                                           |
      | Standard Fee Category Code must be valid                                                                                                   |
      | Outcome Code must be a valid mediation outcome code or left blank                                                                          |
      | Designated Accredited Representative Code must be a number from 1 to 5                                                                     |
      | Mental Health Tribunal Reference must be in format AA/NNNN/NNNNN (English) or AANNNNN (Welsh)                                              |
      | Exemption Criteria Satisfied must be 2 uppercase letters followed by 3 digits                                                              |
      | Exceptional Case Funding Reference must be 7 digits followed by 2 uppercase letters                                                        |
      | Advice Time must be a number                                                                                                               |
      | Travel Time must be a number                                                                                                               |
      | Waiting Time must be a number                                                                                                              |
      | Net Profit Costs Amount must be a number with no more than 2 decimal places                                                                |
      | Net Disbursement Amount must be a valid monetary value                                                                                     |
      | Net Counsel Costs Amount must be a valid monetary value                                                                                    |
      | Disbursements VAT Amount must be a valid monetary value                                                                                    |
      | Prior Authority Reference must be exactly 7 alphanumeric characters                                                                        |
      | Adjourned Hearing Fee Amount must be a number from 0 to 9                                                                                  |
      | Meetings Attended Code must be valid                                                                                                       |
      | Detention Travel Waiting Costs Amount must be a valid monetary value                                                                       |
      | JR Form Filling Amount must be a valid monetary value                                                                                      |
      | Advice Type Code must be valid                                                                                                             |
      | Medical Reports Count must be 20 or less                                                                                                   |
      | Surgery Matters Count must be between 1 and 20                                                                                             |
      | CMRH Oral Count must be between 0 and 9                                                                                                    |
      | CMRH Telephone Count must be between 0 and 9                                                                                               |
      | AIT Hearing Centre Code must be valid                                                                                                      |
      | HO Interview must be between 0 and 9                                                                                                       |
      | Local Authority Number must contain only letters and numbers, and be a maximum of 30 characters                                            |
      | Client 2 Forename must contain only letters, numbers, spaces, hyphens, apostrophes, ampersands, and be a maximum of 30 characters          |
      | Client 2 Surname must contain only letters, numbers, spaces, hyphens, apostrophes, ampersands, and be a maximum of 30 characters           |
      | Client 2 Unique Client Number must be in the format DDMMYYYY/X/ZZZZ with valid date, and be a maximum of 15 characters                     |
      | Client 2 Postcode must be a valid UK postcode or NFA                                                                                       |
      | Client 2 Gender code must be valid                                                                                                         |
      | Client 2 Ethnicity Code must be valid                                                                                                      |
      | Client 2 Disability Code must be valid                                                                                                     |
#      | Costs Damages Recovered Amount must be a valid monetary value                                                                              |

  Scenario: Crime Lower: Should check display messages are shown for value based errors (regex)
    Given I upload "tests/data/invalid/crime_lower_value_regex_errors.csv"
    And I wait on validation in progress screen
    When I should see an error banner saying "1 claim has errors for missing or incorrect information"
    And I should see the following submission error messages for "CRIME LOWER":
      | Error Message                                                    |
      | disbursements vat amount has exceeded the maximum accepted value |

  Scenario: Mediation: Should check display messages are shown for value based errors (regex)
    Given I upload "tests/data/invalid/mediation_value_regex_errors.csv"
    And I wait on validation in progress screen
    When I should see an error banner saying "1 claim has errors for missing or incorrect information"
    And I should see the following submission error messages for "Mediation":
      | Error Message                                                    |
      | disbursements vat amount has exceeded the maximum accepted value |

  Scenario: Legal Help: Should check display messages are shown for value based errors (regex)
    Given I upload "tests/data/invalid/legal_help_value_regex_errors.csv"
    And I wait on validation in progress screen
    When I should see an error banner saying "1 claim has errors for missing or incorrect information"
    And I should see the following submission error messages for "Legal Help":
      | Error Message                                                    |
      | disbursements vat amount has exceeded the maximum accepted value |

  Scenario: Disbursement: Start date checks valid
    Given I generate "Legal help" "csv" file with the following claims
      | feeCode | office |
      | ICISD   | 0P322F |
    And I update case start date to be on 20 and 2 month before submission period
    When I upload the generated file
    Then I should see the submission summary for "Legal help"

  Scenario: Disbursement: Start date checks invalid
    Given I generate "Legal help" "csv" file with the following claims
      | feeCode | office |
      | ICISD   | 0P322F |
    And I update case start date to be on 21 and 2 month before submission period
    When I upload the generated file
    Then I should see the following submission error messages for "Legal help":
      | Error Message                                                                                  |
      | Disbursement claims can only be submitted at least 3 calendar months after the Case Start Date |
