Feature: Escape Fee Calculation for Dec 2025 escape threshold changes

  @api
  Scenario Outline: Escape case for a given payload
    Given I have an initialized API client
    And a fee calculation payload with:
      | feeCode                           | <feeCode>                          |
      | startDate                         | <startDate>                        |
      | netDisbursementAmount             | <netDisbursementAmount>            |
      | disbursementVatAmount             | <disbursementVatAmount>            |
      | vatIndicator                      | <vatIndicator>                     |
      | numberOfMediationSessions         | <numberOfMediationSessions>        |
      | boltOnHomeOfficeInterview         | <boltOnHomeOfficeInterview>        |
      | boltOnAdjournedHearing            | <boltOnAdjournedHearing>           |
      | boltOnCmrhOral                    | <boltOnCmrhOral>                   |
      | boltOnCmrhTelephone               | <boltOnCmrhTelephone>              |
      | boltOnSubstantiveHearing          | <boltOnSubstantiveHearing>         |
      | netProfitCosts                    | <netProfitCosts>                   |
      | netCostOfCounsel                  | <netCostOfCounsel>                 |
      | travelAndWaitingCosts             | <travelAndWaitingCosts>            |
      | uniqueFileNumber                  | <uniqueFileNumber>                 |
      | policeStationId                   | <policeStationId>                  |
      | policeStationSchemeId             | <policeStationSchemeId>            |
      | representationOrderDate           | <representationOrderDate>          |
      | netTravelCosts                    | <netTravelCosts>                   |
      | netWaitingCosts                   | <netWaitingCosts>                  |
      | londonRate                        | <londonRate>                       |
      | immigrationPriorAuthorityNumber   | <immigrationPriorAuthorityNumber>  |
      | detentionTravelAndWaitingCosts    | <detentionTravelAndWaitingCosts>   |
      | jrFormFilling                     | <jrFormFilling>                    |
      | caseConcludedDate                 | <caseConcludedDate>                |

    When I POST "/api/v1/fee-calculation" with the payload
    Then the response status should be 200
    And the JSON path "feeCalculation.totalAmount" should equal number <expectedTotal>
    And the JSON path "escapeCaseFlag" should be boolean <escapeCaseFlag>

    @esc_dec2025_other_civil
    Examples: Other Civil Escape cases
      | feeCode   | startDate  | netProfitCosts | netCostOfCounsel | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal | escapeCaseFlag |
      | DEBT      | 2025-12-22 | 768.01         |                  | No           | 20                    | 15.5                  | 291.50        | TRUE           |
      | ELA       | 2025-12-22 | 669.01         | 5                | No           | 20                    | 10.5                  | 253.50        | TRUE           |
      | HOUS      | 2025-12-22 | 669.01         |                  | Yes          | 20                    | 15.5                  | 303.10        | TRUE           |

    @esc_dec2025_prison_law
    Examples: Prison Law (Escape and fee limit cases)
      | feeCode | startDate  | uniqueFileNumber | netProfitCosts | netTravelCosts | netWaitingCosts | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal | escapeCaseFlag |
      | PRIA    | 2016-04-01 | 221225/001       | 436.8          | 10             | 310.00          | Yes          | 20                    | 10.5                  | 329.22        | TRUE           |
      | PRIB2   | 2016-04-01 | 221225/001       | 1406.01        |                | 691.70          | No           | 20                    | 10.5                  | 730.06        | TRUE           |
      | PRIC2   | 2016-04-01 | 221225/001       | 3047.01        |                | 2362.55         | Yes          | 20                    | 10.5                  | 2194.71       | TRUE           |
      | PRID2   | 2016-04-01 | 221225/001       | 1406.01        |                | 691.70          | No           | 20                    | 10.5                  | 730.06        | TRUE           |
      | PRIE2   | 2016-04-01 | 221225/001       | 3047.01        |                | 2362.55         | Yes          | 20                    | 10.5                  | 2194.71       | TRUE           |
      | PRIB1   | 2016-04-01 | 221225/001       | 285.69         |                | 157.06          | No           | 20                    | 10.5                  | 283.37        | FALSE          |
      | PRIB1   | 2016-04-01 | 221225/001       | 500            | 10             | 0.00            | No           | 20                    | 10.5                  | 283.37        | FALSE          |
      | PRIC1   | 2016-04-01 | 221225/001       | 724.14         |                | 433.93          | Yes          | 20                    | 10.5                  | 681.07        | FALSE          |
      | PRIC1   | 2016-04-01 | 221225/001       | 400            | 10             | 950.00          | Yes          | 20                    | 10.5                  | 681.07        | FALSE          |
      | PRID1   | 2016-04-01 | 221225/001       | 285.69         |                | 157.06          | No           | 20                    | 10.5                  | 283.37        | FALSE          |
      | PRID1   | 2016-04-01 | 221225/001       | 500            | 10             | 0.00            | No           | 20                    | 10.5                  | 283.37        | FALSE          |
      | PRIE1   | 2016-04-01 | 221225/001       | 724.14         |                | 433.93          | Yes          | 20                    | 10.5                  | 681.07        | FALSE          |
      | PRIE1   | 2016-04-01 | 221225/001       | 300            | 10             | 950.00          | Yes          | 20                    | 10.5                  | 681.07        | FALSE          |

    @esc_dec2025_immigration_and_asylum_fixed_fee
    Examples: Immigration and Asylum Fixed Fee
      | feeCode | startDate   | netProfitCosts | netCostOfCounsel | immigrationPriorAuthorityNumber| detentionTravelAndWaitingCosts | jrFormFilling | boltOnHomeOfficeInterview | boltOnAdjournedHearing | boltOnCmrhOral | boltOnCmrhTelephone  | boltOnSubstantiveHearing | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal | escapeCaseFlag |
      | IACE    | 2025-12-22  | 1413.00        | 584.01           |                                | 50                             | 100           |                           |                        | 1              | 2                    |                          | No           | 20                    | 10.5                  | 1369.50       | TRUE           |
      | IACF    | 2025-12-22  | 1810.00        | 1596.01          |                                | 50                             | 100           |                           | 2                      | 1              | 1                    |                          | No           | 599                   | 10.5                  | 2946.50       | TRUE           |
      | IALB    | 2025-12-22  | 1478.01        |                  |                                | 50                             | 100           | 1                         |                        |                |                      |                          | No           | 20                    | 15.5                  | 1104.50       | TRUE           |
      | IMCE    | 2025-12-22  | 2014.00        | 68.01            |                                | 50                             | 100           |                           |                        | 2              | 2                    |                          | No           | 20                    | 15.5                  | 1508.50       | TRUE           |
      | IMCF    | 2025-12-22  | 3309.00        | 20.01            |                                | 50                             | 100           |                           | 2                      | 3              | 1                    |                          | Yes          | 20                    | 15.5                  | 2970.70       | TRUE           |
      | IMLB    | 2025-12-22  | 994.01         |                  |                                | 50                             | 100           | 1                         |                        |                |                      |                          | No           | 20                    | 10.5                  | 857.50        | TRUE           |

    @esc_dec2025_police_station_work
    Examples: Police Station Work Escape cases
      | feeCode | startDate   | uniqueFileNumber | policeStationId | policeStationSchemeId | netProfitCosts | netTravelCosts | netWaitingCosts | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal | escapeCaseFlag |
      | INVC    | 2016-04-01  | 221225/001       | NE001           | 1001                  | 445.01         | 100.00         | 105             | Yes          | 20                    | 10.5                  | 414.50        | TRUE           |
      | INVC    | 2016-04-01  | 221225/001       | NE003           | 1001                  | 433.01         | 100.00         | 117             | No           | 20                    | 10.5                  | 350.50        | TRUE           |
      | INVC    | 2022-09-30  | 221225/001       | NE016           | 1004                  | 412.01         | 100.00         | 138             | Yes          | 20                    | 15.5                  | 419.50        | TRUE           |
      | INVC    | 2022-09-30  | 221225/001       | NE041           | 1010                  | 355.01         | 100.00         | 195             | No           | 20                    | 15.5                  | 355.50        | TRUE           |
      | INVC    | 2024-12-06  | 221225/001       | RD052           | 1141                  | 324.01         | 326.00         |                 | Yes          | 20                    | 15.5                  | 419.50        | TRUE           |
      | INVC    | 2024-12-06  | 221225/001       | RD091           | 1142                  | 361.01         |                | 289             | No           | 20                    | 15.5                  | 355.50        | TRUE           |
