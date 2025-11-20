Feature: Display message checks

  Background:
    Given I am on the bulk import page

  Scenario: Legal Help: Should check display messages are shown for missing field based errors
    Given I upload "tests/data/invalid/legal_help_missing_fields.csv"
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

    # Jamie Note: There is a field called TRAVEL_COSTS which can be set, is this still used?
  Scenario: Legal Help: Should check display messages are shown for format based errors (regex)
    Given I upload "tests/data/invalid/legal_help_regex_errors.csv"
    When I should see an error banner saying "1 claim has errors for missing or incorrect information"
    And I should see the following submission error messages for "LEGAL HELP":
      | Error Message                                                                                                                              |
      | Schedule Reference must be a maximum of 20 characters and contain only letters, numbers, forward slashes, periods, and hyphens             |
      | Case Reference Number must contain only letters, numbers, forward slashes, periods, hyphens, and spaces, and be a maximum of 30 characters |
      | Unique File Number must be in the format DDMMYY/NNN (6 digits forward slash 3 digits)                                                      |
      # broken dates| Case Start Date must be a valid date in the format DD/MM/YYYY                                                                              |
      # broken dates| Case Concluded Date must be a valid date in the format DD/MM/YYYY                                                                          |
      | Each Matter Type Code 1 and 2 must be 4 characters                                                                                         |
      | Fee Code must contain only letters and numbers, and be a maximum of 10 characters                                                          |
      | Procurement Area Code must be 2 uppercase letters followed by 5 digits                                                                     |
      | Access Point Code must be in the format AP##### (AP followed by 5 digits)                                                                  |
      | Client Forename must contain only letters, numbers, spaces, hyphens, apostrophes, ampersands, and be a maximum of 30 characters            |
      | Client Surname must contain only letters, numbers, spaces, hyphens, apostrophes, ampersands, and be a maximum of 30 characters             |
      # broken dates| Client Date of Birth must be a valid date in the format DD/MM/YYYY                                                                         |
      | Unique Client Number must be in the format DDMMYY/X/ZZZZ with valid date, and be a maximum of 15 characters                                |
      | Client Postcode must be a valid UK postcode or NFA                                                                                         |
      | Gender code must be valid                                                                                                                  |
      | Ethnicity Code must be valid                                                                                                               |
      | Disability Code must be valid                                                                                                              |
      | Case ID must be exactly 3 digits                                                                                                           |
      # TODO This is missing from CsvOutcome? => Case Stage/Level Code must be valid                                                                                                        |
      | Stage Reached Code must be exactly 2 alphanumeric characters for Legal Help claims                                                         |
      | Standard Fee Category Code must be valid                                                                                                   |
      | Outcome Code must be exactly 2 characters and contain only letters, numbers, and hyphens                                                   |
      | Designated Accredited Representative Code must be valid                                                                                    |
      # broken boolean | Postal Application Accepted must be Y or N                                                                                                 |
      | Mental Health Tribunal Reference must be in format XX/YYYY/YYYY or XXYYYZZZ                                                                |
      # broken boolean | NRM Advice must be Y or N                                                                                                                  |
      | Follow On Work must be a single character                                                                                                  |
      # broken dates| Transfer Date must be a valid date in the format DD/MM/YYYY                                                                                |
      | Exemption Criteria Satisfied must be 2 uppercase letters followed by 3 digits                                                              |
      | Exceptional Case Funding Reference must be 7 digits followed by 2 uppercase letters                                                        |
      # broken boolean | Legacy Case must be Y or N                                                                                                                 |
      | Advice Time must be in minutes                                                                                                             |
      | Travel Time must be in minutes                                                                                                             |
      | Waiting Time must be in minutes                                                                                                            |
      | Net Profit Costs Amount must be a valid monetary value                                                                                     |
      | Net Disbursement Amount must be a valid monetary value                                                                                     |
      | Net Counsel Costs Amount must be a valid monetary value                                                                                    |
      | Disbursements VAT Amount must be a valid monetary value                                                                                    |
      | Travel Waiting Costs Amount must be a valid monetary value                                                                                 |
      # TODO: broken not mapped??? | Net Waiting Costs Amount must be a valid monetary value                                                                                    |
      # broken boolean | VAT Applicable must be Y or N                                                                                                              |
      # broken boolean | Is Tolerance Applicable must be true or false                                                                                              |
      | Prior Authority Reference must be exactly 7 alphanumeric characters                                                                        |
      # broken boolean | London Rate must be Y or N                                                                                                                 |
      | Adjourned Hearing Fee Amount must be between 0 and 9                                                                                       |
      # broken boolean | Additional Travel Payment must be Y or N                                                                                                   |
      | Costs Damages Recovered Amount must be a valid monetary value                                                                              |
      | Meetings Attended Code must be valid                                                                                                       |
      | Detention Travel Waiting Costs Amount must be a valid monetary value                                                                       |
      | JR Form Filling Amount must be a valid monetary value                                                                                      |
      # broken boolean | Eligible Client must be Y or N                                                                                                             |
      | Advice Type Code must be valid                                                                                                             |
      | Medical Reports Count must be between 0 and 10                                                                                             |
      # broken boolean | IRC Surgery must be Y or N                                                                                                                 |
      # broken date | Surgery Date is invalid                                                                                                                    |
      # TODO: Not being mapped? It's present in CsvOutcome | Surgery Clients Count must be between 1 and 20                                                                                             |
      # TODO: MISSING IN CSV OUTCOME? => | Surgery Matters Count must be between 1 and 20                                                                                             |
      | CMRH Oral Count must be between 0 and 9                                                                                                    |
      | CMRH Telephone Count must be between 0 and 9                                                                                               |
      | AIT Hearing Centre Code must be valid                                                                                                      |
      # broken boolean | Substantive Hearing must be Y or N                                                                                                         |
      | HO Interview must be between 0 and 9                                                                                                       |
      | Local Authority Number must contain only letters and numbers, and be a maximum of 30 characters                                            |

  Scenario: Crime Lower: Should check display messages are shown for missing field based errors
    Given I upload "tests/data/invalid/crime_lower_missing_fields.csv"
    When I should see an error banner saying "1 claim has errors for missing or incorrect information"
    And I should see the following submission error messages for "CRIME LOWER":
      | Error Message                                              |
      | Net Disbursement Amount is required                        |
      | Disbursements Vat Amount is required                       |
      | Case Concluded Date is required for Crime Lower claims     |
      | Net Profit Costs Amount is required for Crime Lower claims |

  Scenario: Crime Lower: Should check display messages are shown for format based errors (regex)
    Given I upload "tests/data/invalid/crime_lower_regex_errors.csv"
    When I should see an error banner saying "1 claim has errors for missing or incorrect information"
    And I should see the following submission error messages for "CRIME LOWER":
      | Error Message                                                                                                                              |
      | Case Reference Number must contain only letters, numbers, forward slashes, periods, hyphens, and spaces, and be a maximum of 30 characters |
      | Unique File Number must be in the format DDMMYY/NNN (6 digits forward slash 3 digits)                                                      |
      # Broken dates| Case Start Date must be a valid date in the format DD/MM/YYYY                                                                               |
      # Broken dates| Case Concluded Date must be a valid date in the format DD/MM/YYYY                                                                                   |
      #TODO Doesn't seem to map to claim entity in Claims API? | Crime Lower Matter Type Code must be exactly 2 digits                                                                                       |
      | Fee Code must contain only letters and numbers, and be a maximum of 10 characters                                                          |
      | Procurement Area Code must be 2 uppercase letters followed by 5 digits                                                                     |
      | Access Point Code must be in the format AP##### (AP followed by 5 digits)                                                                  |
      | Delivery Location must be 2 uppercase letters followed by 5 digits                                                                         |
      # Broken dates| Representation Order Date must be a valid date in the format DD/MM/YYYY                                                                     |
      | Suspects Defendants Count must be between 0 and 99                                                                                         |
      # TODO Not a field on CsvOutcome? | Police Station Court Attendances Count must be between 0 and 99                                                                             |
      # TODO Not a field on CsvOutcome? | Police Station Court Prison ID must be 1–6 alphanumeric characters and contain at least one letter                                          |
      | DSCC Number must be exactly 10 alphanumeric characters                                                                                     |
      | MAAT ID must be up to 10 alphanumeric characters                                                                                           |
      | Prison Law Prior Approval Number must be exactly 10 alphanumeric characters                                                                |
      # Broken boolean | Duty Solicitor must be Y or N                                                                                                               |
      # Broken boolean | Youth Court must be Y or N                                                                                                                  |
      | Scheme ID must be exactly 4 alphanumeric characters                                                                                        |
      | Mediation Sessions Count must be between 1 and 99                                                                                          |
      | Mediation Time Minutes must be between 0 and 99999                                                                                         |
      | Outreach Location must be exactly 3 alphanumeric characters                                                                                |
      | Referral Source must be a valid 2-digit code (02-11)                                                                                       |
      | Client Forename must contain only letters, numbers, spaces, hyphens, apostrophes, ampersands, and be a maximum of 30 characters            |
      | Client Surname must contain only letters, numbers, spaces, hyphens, apostrophes, ampersands, and be a maximum of 30 characters             |
      # Broken dates| Client Date of Birth must be a valid date in the format DD/MM/YYYY                                                                          |
      | Unique Client Number must be in the format DDMMYY/X/ZZZZ with valid date, and be a maximum of 15 characters                                |
      | Client Postcode must be a valid UK postcode or NFA                                                                                         |
      | Gender code must be valid                                                                                                                  |
      | Ethnicity Code must be valid                                                                                                               |
      | Disability Code must be valid                                                                                                              |
      # Broken boolean | Is Legally Aided must be Y or N                                                                                                             |
      | Client Type Code must be valid                                                                                                             |
      # TODO Not a value in CsvOutcome? | Home Office Client Number must contain only letters and numbers, and be a maximum of 16 characters                                          |
      | CLA Reference Number must be between 1 and 7 digits                                                                                        |
      | CLA Exemption Code must be exactly 4 characters                                                                                            |
      | Case ID must be exactly 3 digits                                                                                                           |
# what is this?      | Case Stage/Level Code must be valid                                                                                                         |
      # TODO Not being mapped as expected? | Stage Reached Code must be exactly 4 uppercase letters for Crime Lower claims                                                               |
      | Standard Fee Category Code must be valid                                                                                                   |
      | Outcome Code must be a valid crime lower outcome code or left blank                                                                        |
      | Designated Accredited Representative Code must be valid                                                                                    |
      # Broken boolean | Postal Application Accepted must be Y or N                                                                                                  |
      | Mental Health Tribunal Reference must be in format XX/YYYY/YYYY or XXYYYZZZ                                                                |
      # Broken boolean | NRM Advice must be Y or N                                                                                                                   |
      | Follow On Work must be a single character                                                                                                  |
      # Broken dates| Transfer Date must be a valid date in the format DD/MM/YYYY                                                                                 |
      | Exemption Criteria Satisfied must be 2 uppercase letters followed by 3 digits                                                              |
      | Exceptional Case Funding Reference must be 7 digits followed by 2 uppercase letters                                                        |
      # Broken boolean | Legacy Case must be Y or N                                                                                                                  |
      | Advice Time must be in minutes                                                                                                             |
      | Travel Time must be in minutes                                                                                                             |
      | Waiting Time must be in minutes                                                                                                            |
      | Net Profit Costs Amount must be a valid monetary value                                                                                     |
      | Net Disbursement Amount must be a valid monetary value                                                                                     |
      | Net Counsel Costs Amount must be a valid monetary value                                                                                    |
      | Disbursements VAT Amount must be a valid monetary value                                                                                    |
      | Travel Waiting Costs Amount must be a valid monetary value                                                                                 |
      | Net Waiting Costs Amount must be a valid monetary value                                                                                    |
      # Broken boolean | VAT Applicable must be Y or N                                                                                                               |
      # Broken boolean | Is Tolerance Applicable must be true or false                                                                                               |
      | Prior Authority Reference must be exactly 7 alphanumeric characters                                                                        |
      # Broken boolean | London Rate must be Y or N                                                                                                                  |
      | Adjourned Hearing Fee Amount must be between 0 and 9                                                                                       |
      # Broken boolean | Additional Travel Payment must be Y or N                                                                                                    |
      | Costs Damages Recovered Amount must be a valid monetary value                                                                              |
      | Meetings Attended Code must be valid                                                                                                       |
      | Detention Travel Waiting Costs Amount must be a valid monetary value                                                                       |
      | JR Form Filling Amount must be a valid monetary value                                                                                      |
      # Broken boolean | Eligible Client must be Y or N                                                                                                              |
      | Advice Type Code must be valid                                                                                                             |
      | Medical Reports Count must be between 0 and 10                                                                                             |
      # Broken boolean | IRC Surgery must be Y or N                                                                                                                  |
      # Broken date | Surgery Date is invalid                                                                                                                     |
      | Surgery Matters Count must be between 1 and 20                                                                                             |
      | CMRH Oral Count must be between 0 and 9                                                                                                    |
      | CMRH Telephone Count must be between 0 and 9                                                                                               |
      | AIT Hearing Centre Code must be valid                                                                                                      |
      # Broken boolean | Substantive Hearing must be Y or N                                                                                                          |
      | HO Interview must be between 0 and 9                                                                                                       |
      | Local Authority Number must contain only letters and numbers, and be a maximum of 30 characters                                            |

  Scenario: Mediation: Should check display messages are shown for missing field based errors
    Given I upload "tests/data/invalid/mediation_missing_fields.csv"
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

  @temp
  Scenario: Mediation: Should check display messages are shown for format based errors (regex)
    Given I upload "tests/data/invalid/mediation_regex_errors.csv"
    When I should see an error banner saying "1 claim has errors for missing or incorrect information"
    And I should see the following submission error messages for "MEDIATION":
      | Error Message                                                                                                                              |
      | Case Reference Number must contain only letters, numbers, forward slashes, periods, hyphens, and spaces, and be a maximum of 30 characters |
      | Unique File Number must be in the format DDMMYY/NNN (6 digits forward slash 3 digits)                                                      |
      # broken dates| Case Start Date must be a valid date in the format DD/MM/YYYY                                                                              |
      # broken dates| Case Concluded Date must be a valid date in the format DD/MM/YYYY                                                                          |
      | Each Matter Type Code 1 and 2 must be 4 uppercase characters                                                                               |
      | Fee Code must contain only letters and numbers, and be a maximum of 10 characters                                                          |
      | Procurement Area Code must be 2 uppercase letters followed by 5 digits                                                                     |
      | Access Point Code must be in the format AP##### (AP followed by 5 digits)                                                                  |
      | Client Forename must contain only letters, numbers, spaces, hyphens, apostrophes, ampersands, and be a maximum of 30 characters            |
      | Client Surname must contain only letters, numbers, spaces, hyphens, apostrophes, ampersands, and be a maximum of 30 characters             |
      # broken dates| Client Date of Birth must be a valid date in the format DD/MM/YYYY                                                                         |
      | Unique Client Number must be in the format DDMMYY/X/ZZZZ with valid date, and be a maximum of 15 characters                                |
      | Client Postcode must be a valid UK postcode or NFA                                                                                         |
      | Gender code must be valid                                                                                                                  |
      | Ethnicity Code must be valid                                                                                                               |
      | Disability Code must be valid                                                                                                              |
      | Case ID must be exactly 3 digits                                                                                                           |
      # TODO This is missing from CsvOutcome? => Case Stage/Level Code must be valid                                                                                                        |
      | Standard Fee Category Code must be valid                                                                                                   |
      | Outcome Code must be a valid mediation outcome code or left blank                                                                          |
      | Designated Accredited Representative Code must be valid                                                                                    |
      # broken boolean | Postal Application Accepted must be Y or N                                                                                                 |
      | Mental Health Tribunal Reference must be in format XX/YYYY/YYYY or XXYYYZZZ                                                                |
      # broken boolean | NRM Advice must be Y or N                                                                                                                  |
      | Follow On Work must be a single character                                                                                                  |
      # broken dates| Transfer Date must be a valid date in the format DD/MM/YYYY                                                                                |
      | Exemption Criteria Satisfied must be 2 uppercase letters followed by 3 digits                                                              |
      | Exceptional Case Funding Reference must be 7 digits followed by 2 uppercase letters                                                        |
      # broken boolean | Legacy Case must be Y or N                                                                                                                 |
      | Advice Time must be in minutes                                                                                                             |
      | Travel Time must be in minutes                                                                                                             |
      | Waiting Time must be in minutes                                                                                                            |
      | Net Profit Costs Amount must be a valid monetary value                                                                                     |
      | Net Disbursement Amount must be a valid monetary value                                                                                     |
      | Net Counsel Costs Amount must be a valid monetary value                                                                                    |
      | Disbursements VAT Amount must be a valid monetary value                                                                                    |
      # TODO: Not being mapped? | Travel Waiting Costs Amount must be a valid monetary value                                                                                 |
      # broken not mapped??? | Net Waiting Costs Amount must be a valid monetary value                                                                                    |
      # broken boolean | VAT Applicable must be Y or N                                                                                                              |
      # broken boolean | Is Tolerance Applicable must be true or false                                                                                              |
      | Prior Authority Reference must be exactly 7 alphanumeric characters                                                                        |
      # broken boolean | London Rate must be Y or N                                                                                                                 |
      | Adjourned Hearing Fee Amount must be between 0 and 9                                                                                       |
      # broken boolean | Additional Travel Payment must be Y or N                                                                                                   |
      | Costs Damages Recovered Amount must be a valid monetary value                                                                              |
      | Meetings Attended Code must be valid                                                                                                       |
      | Detention Travel Waiting Costs Amount must be a valid monetary value                                                                       |
      | JR Form Filling Amount must be a valid monetary value                                                                                      |
      # broken boolean | Eligible Client must be Y or N                                                                                                             |
      | Advice Type Code must be valid                                                                                                             |
      | Medical Reports Count must be between 0 and 10                                                                                             |
      # broken boolean | IRC Surgery must be Y or N                                                                                                                 |
      # broken date | Surgery Date is invalid                                                                                                                    |
      | Surgery Matters Count must be between 1 and 20                                                                                             |
      | CMRH Oral Count must be between 0 and 9                                                                                                    |
      | CMRH Telephone Count must be between 0 and 9                                                                                               |
      | AIT Hearing Centre Code must be valid                                                                                                      |
      # broken boolean | Substantive Hearing must be Y or N                                                                                                         |
      | HO Interview must be between 0 and 9                                                                                                       |
      | Local Authority Number must contain only letters and numbers, and be a maximum of 30 characters                                            |
      | Client 2 Forename must contain only letters, numbers, spaces, hyphens, apostrophes, ampersands, and be a maximum of 30 characters          |
      | Client 2 Surname must contain only letters, numbers, spaces, hyphens, apostrophes, ampersands, and be a maximum of 30 characters           |
      # broken date | Client 2 Date of Birth must be a valid date in the format DD/MM/YYYY                                                                       |
      | Client 2 Unique Client Number must be in the format DDMMYY/X/ZZZZ with valid date, and be a maximum of 15 characters                       |
      # TODO Not mapping to CsvOutcome (Jackson?) | Client 2 Postcode must be a valid UK postcode or NFA                                                                                       |
      # TODO Not mapping to CsvOutcome (Jackson?) | Client 2 Gender code must be valid                                                                                                         |
      # TODO Not mapping to CsvOutcome (Jackson?) | Client 2 Ethnicity Code must be valid                                                                                                      |
      # TODO Not mapping to CsvOutcome (Jackson?) | Client 2 Disability Code must be valid                                                                                                     |
      # broken boolean | Client 2 Is Legally Aided must be Y or N                                                                                                   |
      # broken boolean | Client 2 Postal Application Accepted must be Y or N                                                                                        |
