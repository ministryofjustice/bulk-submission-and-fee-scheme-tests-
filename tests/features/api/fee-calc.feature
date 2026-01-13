Feature: Fee Calculation API

  @api
  Scenario Outline: Calculate fee total for a given payload
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

    @other_civil_sg
    Examples: Other Civil
      | feeCode   | startDate  | netProfitCosts | netCostOfCounsel | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal |
      | COM       | 2013-04-01 |                |                  | Yes          | 20                    | 10.5                  | 349.70        |
      | CAPA      | 2013-04-01 |                |                  | No           | 20                    | 10.5                  | 269.50        |
      | CLIN      | 2013-04-01 |                |                  | Yes          | 20                    | 15.5                  | 269.50        |
      | DEBT      | 2013-04-01 |                |                  | No           | 20                    | 15.5                  | 215.50        |
      | EDUFIN    | 2013-04-01 |                |                  | Yes          | 20                    | 10.5                  | 356.90        |
      | ELA       | 2024-09-01 |                |                  | No           | 20                    | 10.5                  | 187.50        |
      | HOUS      | 2013-04-01 |                |                  | Yes          | 20                    | 15.5                  | 223.90        |
      | MISCGEN   | 2013-04-01 |                |                  | No           | 20                    | 15.5                  | 114.50        |
      | MISCCON   | 2013-04-01 |                |                  | Yes          | 20                    | 10.5                  | 221.30        |
      | MISCPI    | 2013-04-01 |                |                  | No           | 20                    | 10.5                  | 233.50        |
      | MISCASBI  | 2015-03-23 |                |                  | Yes          | 20                    | 15.5                  | 223.90        |
      | MISCEMP   | 2013-04-01 |                |                  | No           | 20                    | 15.5                  | 242.50        |
      | PUB       | 2013-04-01 |                |                  | Yes          | 20                    | 10.5                  | 341.30        |
      | WFB1      | 2025-05-01 |                |                  | No           | 20                    | 10.5                  | 238.50        |
      | WFB1      | 2023-04-01 |                |                  | Yes          | 20                    | 15.5                  | 285.10        |
      | WFB1      | 2025-04-30 |                |                  | No           | 20                    | 15.5                  | 243.50        |

    @welfare_benefits
    Examples: Welfare Benefits
      | feeCode | startDate  | netDisbursementAmount | disbursementVatAmount | vatIndicator | numberOfMediationSessions | boltOnAdjournedHearing | expectedTotal |
      | WFB1    | 2014-02-01 | 20                    | 10.50                 | true         | 0                         | 0                      | 280.10        |
      | WFB1    | 2025-04-30 | 20                    | 10.50                 | false        | 0                         | 0                      | 238.50        |
      | WFB1    | 2025-05-01 | 20                    | 15.50                 | true         | 0                         | 0                      | 285.10        |
      | WFB1    | 2025-05-01 | 20                    | 15.50                 | false        | 0                         | 0                      | 243.50        |


    @mediation_sg
    Examples: Mediation SG
      | feeCode  | startDate  | numberOfMediationSessions | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal |
      | ASSA     | 2013-04-01 |                           | Yes          | 20                    | 10.5                  | 134.90        |
      | ASSS     | 2013-04-01 |                           | No           | 20                    | 10.5                  | 117.50        |
      | ASST     | 2013-04-01 |                           | Yes          | 20                    | 15.5                  | 191.50        |
      | MDAS2B   | 2013-04-01 | 1                         | No           | 20                    | 15.5                  | 203.50        |
      | MDAS2B   | 2013-04-01 | 2                         | Yes          | 20                    | 10.5                  | 937.70        |
      | MDAS1B   | 2013-04-01 | 1                         | No           | 20                    | 10.5                  | 198.50        |
      | MDAS1B   | 2013-04-01 | 3                         | Yes          | 20                    | 15.5                  | 589.90        |
      | MDAC2B   | 2013-04-01 | 1                         | No           | 20                    | 15.5                  | 265.50        |
      | MDAC2B   | 2013-04-01 | 2                         | Yes          | 20                    | 10.5                  | 1307.30       |
      | MDAC1B   | 2013-04-01 | 1                         | No           | 20                    | 10.5                  | 260.50        |
      | MDAC1B   | 2013-04-01 | 4                         | Yes          | 20                    | 15.5                  | 811.90        |
      | MDAS2S   | 2013-04-01 | 1                         | No           | 20                    | 15.5                  | 455.50        |
      | MDAS2S   | 2013-04-01 | 2                         | Yes          | 20                    | 10.5                  | 1240.10       |
      | MDAS1S   | 2013-04-01 | 1                         | No           | 20                    | 10.5                  | 324.50        |
      | MDAS1S   | 2013-04-01 | 3                         | Yes          | 20                    | 15.5                  | 741.10        |
      | MDAS2P   | 2013-04-01 | 1                         | No           | 20                    | 15.5                  | 392.50        |
      | MDAS2P   | 2013-04-01 | 2                         | Yes          | 20                    | 10.5                  | 1164.50       |
      | MDAS1P   | 2013-04-01 | 1                         | No           | 20                    | 10.5                  | 293.00        |
      | MDAS1P   | 2013-04-01 | 4                         | Yes          | 20                    | 15.5                  | 703.30        |
      | MDAS2C   | 2013-04-01 | 1                         | No           | 20                    | 15.5                  | 329.50        |
      | MDAS2C   | 2013-04-01 | 2                         | Yes          | 20                    | 10.5                  | 1088.90       |
      | MDAS1C   | 2013-04-01 | 1                         | No           | 20                    | 10.5                  | 261.50        |
      | MDAS1C   | 2013-04-01 | 3                         | Yes          | 20                    | 15.5                  | 665.50        |
      | MDAC2S   | 2013-04-01 | 1                         | No           | 20                    | 15.5                  | 517.50        |
      | MDAC2S   | 2013-04-01 | 2                         | Yes          | 20                    | 10.5                  | 1609.70       |
      | MDAC1S   | 2013-04-01 | 1                         | No           | 20                    | 10.5                  | 386.50        |
      | MDAC1S   | 2013-04-01 | 4                         | Yes          | 20                    | 15.5                  | 963.10        |
      | MDAC2P   | 2013-04-01 | 1                         | No           | 20                    | 15.5                  | 454.50        |
      | MDAC2P   | 2013-04-01 | 2                         | Yes          | 20                    | 10.5                  | 1534.10       |
      | MDAC1P   | 2013-04-01 | 1                         | No           | 20                    | 10.5                  | 355.00        |
      | MDAC1P   | 2013-04-01 | 3                         | Yes          | 20                    | 15.5                  | 925.30        |
      | MDAC2C   | 2013-04-01 | 1                         | No           | 20                    | 15.5                  | 391.50        |
      | MDAC2C   | 2013-04-01 | 2                         | Yes          | 20                    | 10.5                  | 1458.50       |
      | MDAC1C   | 2013-04-01 | 1                         | No           | 20                    | 10.5                  | 323.50        |
      | MDAC1C   | 2013-04-01 | 4                         | Yes          | 20                    | 15.5                  | 887.50        |
      | MDPS2B   | 2013-04-01 | 1                         | No           | 20                    | 15.5                  | 203.50        |
      | MDPS2B   | 2013-04-01 | 2                         | Yes          | 20                    | 10.5                  | 736.10        |
      | MDPS1B   | 2013-04-01 | 1                         | No           | 20                    | 10.5                  | 198.50        |
      | MDPS1B   | 2013-04-01 | 3                         | Yes          | 20                    | 15.5                  | 489.10        |
      | MDPC2B   | 2013-04-01 | 1                         | No           | 20                    | 15.5                  | 265.50        |
      | MDPC2B   | 2013-04-01 | 2                         | Yes          | 20                    | 10.5                  | 1031.30       |
      | MDPC1B   | 2013-04-01 | 1                         | No           | 20                    | 10.5                  | 260.50        |
      | MDPC1B   | 2013-04-01 | 4                         | Yes          | 20                    | 15.5                  | 673.90        |
      | MDPS2S   | 2013-04-01 | 1                         | No           | 20                    | 15.5                  | 392.50        |
      | MDPS2S   | 2013-04-01 | 2                         | Yes          | 20                    | 10.5                  | 962.90        |
      | MDPS1S   | 2013-04-01 | 1                         | No           | 20                    | 10.5                  | 293.00        |
      | MDPS1S   | 2013-04-01 | 3                         | Yes          | 20                    | 15.5                  | 602.50        |
      | MDPC2S   | 2013-04-01 | 1                         | No           | 20                    | 15.5                  | 454.50        |
      | MDPC2S   | 2013-04-01 | 2                         | Yes          | 20                    | 10.5                  | 1258.10       |
      | MDPC1S   | 2013-04-01 | 1                         | No           | 20                    | 10.5                  | 355.00        |
      | MDPC1S   | 2013-04-01 | 4                         | Yes          | 20                    | 15.5                  | 787.30        |
      | MDCS2B   | 2013-04-01 | 1                         | No           | 20                    | 15.5                  | 203.50        |
      | MDCS2B   | 2013-04-01 | 2                         | Yes          | 20                    | 10.5                  | 584.90        |
      | MDCS1B   | 2013-04-01 | 1                         | No           | 20                    | 10.5                  | 198.50        |
      | MDCS1B   | 2013-04-01 | 3                         | Yes          | 20                    | 15.5                  | 413.50        |
      | MDCC2B   | 2013-04-01 | 1                         | No           | 20                    | 15.5                  | 265.50        |
      | MDCC2B   | 2013-04-01 | 2                         | Yes          | 20                    | 10.5                  | 806.90        |
      | MDCC1B   | 2013-04-01 | 1                         | No           | 20                    | 10.5                  | 260.50        |
      | MDCC1B   | 2013-04-01 | 4                         | Yes          | 20                    | 15.5                  | 561.70        |
      | MDCS2S   | 2013-04-01 | 1                         | No           | 20                    | 15.5                  | 329.50        |
      | MDCS2S   | 2013-04-01 | 2                         | Yes          | 20                    | 10.5                  | 736.10        |
      | MDCS1S   | 2013-04-01 | 1                         | No           | 20                    | 10.5                  | 261.50        |
      | MDCS1S   | 2013-04-01 | 3                         | Yes          | 20                    | 15.5                  | 489.10        |
      | MDCC2S   | 2013-04-01 | 1                         | No           | 20                    | 15.5                  | 391.50        |
      | MDCC2S   | 2013-04-01 | 2                         | Yes          | 20                    | 10.5                  | 958.10        |
      | MDCC1S   | 2013-04-01 | 1                         | No           | 20                    | 10.5                  | 323.50        |
      | MDCC1S   | 2013-04-01 | 4                         | Yes          | 20                    | 15.5                  | 637.30        |


    @mental_health_sg
    Examples: Mental Health SG reworked to include all codes
      | feeCode | startDate  | netProfitCosts | netCostOfCounsel | boltOnAdjournedHearing | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal |
      | MHL01   | 2013-04-01 | 100.00         |                  |                        | Yes          | 20                    | 10.5                  | 334.10        |
      | MHL02   | 2013-04-01 |                |                  | 1                      | No           | 20                    | 10.5                  | 276.50        |
      | MHL03   | 2013-04-01 |                |                  | 2                      | Yes          | 20                    | 15.5                  | 856.30        |
      | MHL04   | 2013-04-01 |                | 100.00           | 9                      | No           | 20                    | 15.5                  | 1832.50       |
      | MHL05   | 2013-04-01 |                |                  | 4                      | Yes          | 5                     | 10.5                  | 962.30        |
      | MHL06   | 2013-04-01 |                |                  | 5                      | No           | 20                    | 10.5                  | 1230.50       |
      | MHL07   | 2013-04-01 | 100.00         |                  | 3                      | Yes          | 20                    | 15.5                  | 809.50        |
      | MHL08   | 2013-04-01 |                |                  | 4                      | No           | 20                    | 15.5                  | 926.50        |
      | MHL10   | 2013-04-01 |                |                  |                        | Yes          | 20                    | 10.5                  | 185.30        |

    @discrimination_sg
    Examples: Discrimination sg
      | feeCode | startDate  | netProfitCosts | netCostOfCounsel | travelAndWaitingCosts | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal |
      | DISC    | 2013-04-01 | 400            | 300              | 100                   | Yes          | 20                    | 10.5                  | 870.50        |
      | DISC    | 2013-04-01 | 300            | 399              |                       | No           | 20                    | 10.5                  | 729.50        |
      | DISC    | 2013-04-01 |                | 700              |                       | Yes          | 20                    | 15.5                  | 875.50        |
      | DISC    | 2013-04-01 | 700            |                  |                       | No           | 20                    | 15.5                  | 735.50        |

    @police_station_work
    Examples: Police Station Work
      | feeCode  | startDate  | uniqueFileNumber  | policeStationId | policeStationSchemeId  | netDisbursementAmount | disbursementVatAmount | vatIndicator | numberOfMediationSessions | boltOnAdjournedHearing | expectedTotal |
      | INVC     | 2016-04-01 | 110516/001        | NE001           | 1001                   | 20                    | 10.50                 | true         | 0                         | 0                      | 188.18        |
      | INVC     | 2016-04-01 | 110516/002        | NE003           | 1001                   | 20                    | 10.50                 | false        | 0                         | 0                      | 166.46        |
      | INVC     | 2022-09-30 | 121022/003        | NE016           | 1004                   | 20                    | 15.50                 | true         | 0                         | 0                      | 245.80        |
      | INVC     | 2022-09-30 | 121022/004        | NE041           | 1010                   | 20                    | 15.50                 | false        | 0                         | 0                      | 197.11        |
      | INVC     | 2024-12-06 | 131224/005        | RD052           | 1141                   | 20                    | 15.50                 | true         | 0                         | 0                      | 325.94        |
      | INVC     | 2024-12-06 | 131224/006        | RD091           | 1142                   | 20                    | 15.50                 | false        | 0                         | 0                      | 259.02        |

    @police_other_hourly_rate
    Examples: Police Other Hourly Rate
      | feeCode | startDate  | uniqueFileNumber | netProfitCosts | netTravelCosts | netWaitingCosts | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal |
      | INVA    | 2016-04-01 | 010416/001       | 20             | 50             | 60              | Yes          | 20                    | 10.5                  | 190.50        |
      | INVA    | 2022-09-30 | 290922/002       | 100            | 40             | 100             | No           | 20                    | 10.5                  | 270.50        |
      | INVA    | 2022-09-30 | 300922/003       | 40             | 100            | 50              | Yes          | 20                    | 15.5                  | 267.50        |
      | INVE    | 2016-04-01 | 010416/001       | 400            | 200            | 100             | No           | 20                    | 15.5                  | 735.50        |
      | INVE    | 2022-09-30 | 290922/002       | 300            | 200            | 600             | Yes          | 20                    | 10.5                  | 1354.50       |
      | INVE    | 2022-09-30 | 300922/003       | 400            | 500            | 600             | No           | 20                    | 10.5                  | 1530.50       |
      | INVH    | 2016-04-01 | 010416/001       | 400            | 200            | 100             | Yes          | 20                    | 15.5                  | 879.50        |
      | INVH    | 2022-09-30 | 290922/002       | 300            | 200            | 600             | No           | 20                    | 15.5                  | 1135.50       |
      | INVH    | 2022-09-30 | 300922/003       | 400            | 500            | 600             | Yes          | 20                    | 10.5                  | 1834.50       |
      | INVK    | 2016-04-01 | 010416/001       | 400            | 200            | 100             | No           | 20                    | 10.5                  | 730.50        |
      | INVK    | 2022-09-30 | 290922/002       | 300            | 200            | 600             | Yes          | 20                    | 15.5                  | 1359.50       |
      | INVK    | 2022-09-30 | 300922/003       | 400            | 500            | 600             | No           | 20                    | 15.5                  | 1535.50       |
      | INVL    | 2016-04-01 | 010416/001       | 400            | 200            | 100             | Yes          | 20                    | 10.5                  | 874.50        |
      | INVL    | 2022-09-30 | 290922/002       | 300            | 200            | 600             | No           | 20                    | 10.5                  | 1130.50       |
      | INVL    | 2022-09-30 | 300922/003       | 400            | 500            | 600             | Yes          | 20                    | 15.5                  | 1839.50       |
      | INVM    | 2021-06-07 | 070621/001       | 20             | 50             | 60              | No           | 20                    | 15.5                  | 165.50        |
      | INVM    | 2022-09-30 | 290922/002       | 100            | 40             | 100             | Yes          | 20                    | 10.5                  | 322.50        |
      | INVM    | 2022-09-30 | 300922/003       | 40             | 100            | 50              | No           | 20                    | 10.5                  | 220.50        |

    @police_other_fixed_fee
    Examples: Police Other Fixed Fee
      | feeCode | startDate  | uniqueFileNumber | netProfitCosts | netTravelCosts | netWaitingCosts | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal |
      | INVB1   | 2016-04-01 | 010416/001       | 45             |                |                 | Yes          | 20                    | 10.5                  | 34.44         |
      | INVB1   | 2022-09-30 | 290922/002       |                | 20             |                 | No           | 20                    | 10.5                  | 28.70         |
      | INVB1   | 2022-09-30 | 300922/003       |                | 60             |                 | Yes          | 20                    | 15.5                  | 39.60         |
      | INVB2   | 2016-04-01 | 010416/001       | 10             |                |                 | No           | 20                    | 15.5                  | 27.60         |
      | INVB2   | 2022-09-30 | 290922/002       |                | 30             |                 | Yes          | 20                    | 10.5                  | 33.12         |
      | INVB2   | 2022-09-30 | 300922/003       |                | 30             |                 | No           | 20                    | 10.5                  | 31.74         |

    @education
    Examples: Education
      | feeCode   | startDate  | netDisbursementAmount | disbursementVatAmount | vatIndicator | numberOfMediationSessions | boltOnAdjournedHearing | expectedTotal |
      | EDUFIN    | 2013-04-01 | 20                    | 10.50                 | true         | 0                         | 0                      | 356.90        |
      | EDUFIN    | 2013-04-01 | 20                    | 10.50                 | false        | 0                         | 0                      | 302.50        |
      | EDUFIN    | 2013-04-01 | 20                    | 15.50                 | true         | 0                         | 0                      | 361.90        |
      | EDUFIN    | 2013-04-01 | 20                    | 15.50                 | false        | 0                         | 0                      | 307.50        |

    @mags_court_designated
    Examples: Mags Court Designated
      | feeCode  | startDate  | representationOrderDate |netDisbursementAmount | disbursementVatAmount | vatIndicator | numberOfMediationSessions | boltOnAdjournedHearing | expectedTotal |
      | PROJ5    | 2016-04-01 | 2016-04-01              |20                    | 10.50                 | true         | 0                         | 0                      | 328.95        |
      | PROJ5    | 2022-09-30 | 2022-09-30              |20                    | 10.50                 | false        | 0                         | 0                      | 316.52        |
      | PROJ6    | 2016-04-01 | 2016-04-01              |20                    | 15.50                 | true         | 0                         | 0                      | 278.14        |
      | PROJ6    | 2022-09-30 | 2022-09-30              |20                    | 15.50                 | false        | 0                         | 0                      | 268.03        |
      | PROJ7    | 2016-04-01 | 2022-09-29              |20                    | 10.50                 | true         | 0                         | 0                      | 596.67        |
      | PROJ8    | 2016-04-01 | 2016-04-02              |20                    | 10.50                 | false        | 0                         | 0                      | 466.14        |
      | PROK1    | 2016-04-01 | 2016-04-01              |20                    | 15.50                 | true         | 0                         | 0                      | 333.95        |
      | PROK2    | 2016-04-01 | 2016-04-01              |20                    | 15.50                 | false        | 0                         | 0                      | 237.70        |
      | PROK3    | 2022-09-30 | 2022-09-30              |20                    | 10.50                 | true         | 0                         | 0                      | 507.07        |
      | PROL1    | 2022-09-30 | 2022-09-30              |20                    | 10.50                 | false        | 0                         | 0                      | 573.08        |
      | PROL2    | 2016-04-01 | 2016-04-01              |20                    | 15.50                 | true         | 0                         | 0                      | 558.27        |
      | PROL3    | 2022-09-30 | 2022-10-01              |20                    | 15.50                 | false        | 0                         | 0                      | 867.35        |

    @youth_court_designated
    Examples: Youth Court Designated
      | feeCode  | startDate  | representationOrderDate |netDisbursementAmount | disbursementVatAmount | vatIndicator | numberOfMediationSessions | boltOnAdjournedHearing | expectedTotal  |
      | YOUK1    | 2024-12-06 | 2024-12-06              |20                    | 10.50                 | true         | 0                         | 0                      | 1092.03        |
      | YOUK2    | 2024-12-06 | 2024-12-07              |20                    | 10.50                 | false        | 0                         | 0                      | 263.03         |
      | YOUK3    | 2024-12-06 | 2025-01-01              |20                    | 15.50                 | true         | 0                         | 0                      | 1230.38        |
      | YOUK4    | 2024-12-06 | 2025-05-05              |20                    | 15.50                 | false        | 0                         | 0                      | 432.64         |
      | YOUL1    | 2024-12-06 | 2024-12-06              |20                    | 10.50                 | true         | 0                         | 0                      | 1399.90        |
      | YOUL2    | 2024-12-06 | 2024-12-07              |20                    | 10.50                 | false        | 0                         | 0                      | 531.49         |
      | YOUL3    | 2024-12-06 | 2025-01-01              |20                    | 15.50                 | true         | 0                         | 0                      | 1752.03        |
      | YOUL4    | 2024-12-06 | 2025-05-05              |20                    | 15.50                 | false        | 0                         | 0                      | 867.35         |
      | YOUY1    | 2024-12-06 | 2024-12-06              |20                    | 10.50                 | true         | 0                         | 0                      | 1092.03        |
      | YOUY2    | 2024-12-06 | 2024-12-07              |20                    | 10.50                 | false        | 0                         | 0                      | 263.03         |
      | YOUY3    | 2024-12-06 | 2025-01-01              |20                    | 15.50                 | true         | 0                         | 0                      | 1404.90        |
      | YOUY4    | 2024-12-06 | 2025-05-05              |20                    | 15.50                 | false        | 0                         | 0                      | 536.49         |

    @mags_court_undesignated
    Examples: Mags Court Undesignated
      | feeCode  | startDate  | representationOrderDate | netTravelCosts| netWaitingCosts | netDisbursementAmount | disbursementVatAmount | vatIndicator | numberOfMediationSessions | boltOnAdjournedHearing | expectedTotal |
      | PROE1    | 2016-04-01 | 2016-04-01              | 100           | 50              | 20                    | 10.50                 | true         | 0                         | 0                      | 444.12        |
      | PROE1    | 2022-09-30 | 2022-09-30              | 100           | 50              | 20                    | 10.50                 | false        | 0                         | 0                      | 404.38        |
      | PROE2    | 2016-04-01 | 2016-04-01              | 100           | 50              | 20                    | 15.50                 | true         | 0                         | 0                      | 405.42        |
      | PROE2    | 2022-09-30 | 2022-09-30              | 100           | 50              | 20                    | 15.50                 | false        | 0                         | 0                      | 367.51        |
      | PROE3    | 2016-04-01 | 2016-04-01              | 100           | 50              | 20                    | 10.50                 | true         | 0                         | 0                      | 545.84        |
      | PROF1    | 2022-09-30 | 2022-09-30              | 100           | 50              | 20                    | 10.50                 | false        | 0                         | 0                      | 654.65        |
      | PROF2    | 2016-04-01 | 2022-09-29              | 100           | 50              | 20                    | 15.50                 | true         | 0                         | 0                      | 672.34        |
      | PROF3    | 2016-04-01 | 2016-04-02              | 100           | 50              | 20                    | 15.50                 | false        | 0                         | 0                      | 826.44        |
      | PROJ1    | 2016-04-01 | 2016-04-01              | 100           | 50              | 20                    | 10.50                 | true         | 0                         | 0                      | 444.12        |
      | PROJ2    | 2016-04-01 | 2016-04-01              | 100           | 50              | 20                    | 10.50                 | false        | 0                         | 0                      | 338.77        |
      | PROJ3    | 2022-09-30 | 2022-09-30              | 100           | 50              | 20                    | 15.50                 | true         | 0                         | 0                      | 784.48        |
      | PROJ4    | 2022-09-30 | 2022-09-30              | 100           | 50              | 20                    | 15.50                 | false        | 0                         | 0                      | 623.31        |
      | PROV1    | 2016-04-01 | 2016-04-01              | 100           | 50              | 20                    | 10.50                 | true         | 0                         | 0                      | 400.42        |
      | PROV2    | 2022-09-30 | 2022-09-30              | 100           | 50              | 20                    | 10.50                 | false        | 0                         | 0                      | 618.31        |
      | PROV3    | 2016-04-01 | 2016-04-01              | 100           | 50              | 20                    | 15.50                 | true         | 0                         | 0                      | 550.84        |
      | PROV4    | 2022-09-30 | 2024-10-01              | 100           | 50              | 20                    | 15.50                 | false        | 0                         | 0                      | 922.58        |

    @youth_court_undesignated
    Examples: Youth Court Undesignated
      | feeCode  | startDate  | representationOrderDate | netTravelCosts| netWaitingCosts | netDisbursementAmount | disbursementVatAmount | vatIndicator | numberOfMediationSessions | boltOnAdjournedHearing | expectedTotal |
      | YOUE1    | 2024-12-06 | 2024-12-06              | 100           | 50              | 20                    | 10.50                 | true         | 0                         | 0                      | 1197.46       |
      | YOUE2    | 2024-12-06 | 2024-12-07              | 100           | 50              | 20                    | 10.50                 | false        | 0                         | 0                      | 362.51        |
      | YOUE3    | 2024-12-06 | 2025-01-01              | 100           | 50              | 20                    | 15.50                 | true         | 0                         | 0                      | 1319.45       |
      | YOUE4    | 2024-12-06 | 2025-05-05              | 100           | 50              | 20                    | 15.50                 | false        | 0                         | 0                      | 506.87        |
      | YOUF1    | 2024-12-06 | 2024-12-06              | 100           | 50              | 20                    | 10.50                 | true         | 0                         | 0                      | 1497.79       |
      | YOUF2    | 2024-12-06 | 2024-12-07              | 100           | 50              | 20                    | 10.50                 | false        | 0                         | 0                      | 618.31        |
      | YOUF3    | 2024-12-06 | 2025-01-01              | 100           | 50              | 20                    | 15.50                 | true         | 0                         | 0                      | 1818.30       |
      | YOUF4    | 2024-12-06 | 2025-05-05              | 100           | 50              | 20                    | 15.50                 | false        | 0                         | 0                      | 922.58        |
      | YOUX1    | 2024-12-06 | 2024-12-06              | 100           | 50              | 20                    | 10.50                 | true         | 0                         | 0                      | 1197.46       |
      | YOUX2    | 2024-12-06 | 2024-12-07              | 100           | 50              | 20                    | 10.50                 | false        | 0                         | 0                      | 362.51        |
      | YOUX3    | 2024-12-06 | 2025-01-01              | 100           | 50              | 20                    | 15.50                 | true         | 0                         | 0                      | 1502.79       |
      | YOUX4    | 2024-12-06 | 2025-05-05              | 100           | 50              | 20                    | 15.50                 | false        | 0                         | 0                      | 623.31        |

    @assoc_civil_work
    Examples: Associated Civil Work
      | feeCode  | startDate  | uniqueFileNumber  | netTravelCosts| netWaitingCosts  | netDisbursementAmount | disbursementVatAmount | vatIndicator | numberOfMediationSessions | boltOnAdjournedHearing | expectedTotal |
      | ASMS     |            | 110516/001        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 125.30        |
      | ASMS     | 2016-04-01 | 010416/002        | 0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 109.50        |
      | ASPL     | 2016-04-01 | 110619/003        | 0             | 0                | 20                    | 15.50                 | true         | 0                         | 0                      | 346.30        |
      | ASPL     | 2016-04-01 | 161224/004        | 0             | 0                | 20                    | 15.50                 | false        | 0                         | 0                      | 294.50        |
      | ASAS     | 2016-04-01 | 200118/005        | 0             | 0                | 20                    | 15.50                 | true         | 0                         | 0                      | 223.90        |
      | ASAS     | 2016-04-01 | 020416/006        | 0             | 0                | 20                    | 15.50                 | false        | 0                         | 0                      | 192.50        |

    @family
    Examples: Family
      | feeCode  | startDate  | londonRate  | netTravelCosts| netWaitingCosts  | netDisbursementAmount | disbursementVatAmount | vatIndicator | numberOfMediationSessions | boltOnAdjournedHearing | expectedTotal |
      | FPB010   | 2013-04-01 | true        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 188.90        |
      | FPB020   | 2013-04-01 | false       | 0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 395.50        |
      | FPB030   | 2013-04-01 | true        | 0             | 0                | 20                    | 15.50                 | true         | 0                         | 0                      | 631.90        |
      | FVP100   | 2013-04-01 | false       | 0             | 0                | 20                    | 15.50                 | false        | 0                         | 0                      | 181.50        |
      | FVP012   | 2013-04-01 | true        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 133.70        |
      | FVP011   | 2013-04-01 | false       | 0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 116.50        |
      | FVP013   | 2013-04-01 | true        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 133.70        |
      | FVP010   | 2013-04-01 | false       | 0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 116.50        |
      | FVP110   | 2013-04-01 | true        | 0             | 0                | 20                    | 15.50                 | true         | 0                         | 0                      | 477.10        |
      | FVP130   | 2013-04-01 | false       | 0             | 0                | 20                    | 15.50                 | false        | 0                         | 0                      | 234.50        |
      | FVP120   | 2013-04-01 | true        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 493.70        |
      | FVP140   | 2013-04-01 | false       | 0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 238.50        |
      | FVP150   | 2013-04-01 | true        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 935.30        |
      | FVP180   | 2013-04-01 | false       | 0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 437.50        |
      | FVP160   | 2013-04-01 | true        | 0             | 0                | 20                    | 15.50                 | true         | 0                         | 0                      | 766.30        |
      | FVP170   | 2013-04-01 | false       | 0             | 0                | 20                    | 15.50                 | false        | 0                         | 0                      | 567.50        |
      | FVP190   | 2013-04-01 | true        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 210.50        |
      | FVP200   | 2013-04-01 | false       | 0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 230.50        |
      | FVP210   | 2013-04-01 | true        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 450.50        |
      | FVP020   | 2013-04-01 | false       | 0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 434.50        |
      | FVP040   | 2013-04-01 | true        | 0             | 0                | 20                    | 15.50                 | true         | 0                         | 0                      | 414.70        |
      | FVP030   | 2013-04-01 | false       | 0             | 0                | 20                    | 15.50                 | false        | 0                         | 0                      | 454.50        |
      | FVP050   | 2013-04-01 | true        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 422.90        |
      | FVP060   | 2013-04-01 | false       | 0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 767.50        |
      | FVP090   | 2013-04-01 | true        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 698.90        |
      | FVP070   | 2013-04-01 | false       | 0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 642.50        |
      | FVP080   | 2013-04-01 | true        | 0             | 0                | 20                    | 15.50                 | true         | 0                         | 0                      | 877.90        |
      | FVP021   | 2013-04-01 | false       | 0             | 0                | 20                    | 15.50                 | false        | 0                         | 0                      | 439.50        |
      | FVP041   | 2013-04-01 | true        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 409.70        |
      | FVP031   | 2013-04-01 | false       | 0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 449.50        |
      | FVP051   | 2013-04-01 | true        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 422.90        |
      | FVP061   | 2013-04-01 | false       | 0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 767.50        |
      | FVP091   | 2013-04-01 | true        | 0             | 0                | 20                    | 15.50                 | true         | 0                         | 0                      | 703.90        |
      | FVP071   | 2013-04-01 | false       | 0             | 0                | 20                    | 15.50                 | false        | 0                         | 0                      | 647.50        |
      | FVP081   | 2013-04-01 | true        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 872.90        |

    @prison_law
    Examples: Prison Law
      | feeCode  | startDate  | uniqueFileNumber  | netTravelCosts| netWaitingCosts  | netDisbursementAmount | disbursementVatAmount | vatIndicator | numberOfMediationSessions | boltOnAdjournedHearing | expectedTotal |
      | PRIA     | 2016-04-01 | 110516/001        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 271.40        |
      | PRIB1    | 2016-04-01 | 010416/002        | 0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 234.43        |
      | PRIB2    | 2016-04-01 | 110619/003        | 0             | 0                | 20                    | 15.50                 | true         | 0                         | 0                      | 712.49        |
      | PRIC1    | 2016-04-01 | 161224/004        | 0             | 0                | 20                    | 15.50                 | false        | 0                         | 0                      | 472.71        |
      | PRIC2    | 2016-04-01 | 200118/005        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 1775.83       |
      | PRID1    | 2016-04-01 | 020416/006        | 0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 234.43        |
      | PRID2    | 2016-04-01 | 110516/001        | 0             | 0                | 20                    | 15.50                 | true         | 0                         | 0                      | 712.49        |
      | PRIE1    | 2016-04-01 | 010416/002        | 0             | 0                | 20                    | 15.50                 | false        | 0                         | 0                      | 472.71        |
      | PRIE2    | 2016-04-01 | 020416/003        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 1775.83       |

    @appeals_and_reviews
    Examples: Appeals and Reviews
      | feeCode | startDate   | uniqueFileNumber | representationOrderDate  | netProfitCosts | netTravelCosts | netWaitingCosts  | vatIndicator | netDisbursementAmount  | disbursementVatAmount  | expectedTotal  |
      | PROH    | 2022-09-30  | 110516/001       | 2022-10-01               | 1503.56        | 20.5           | 30               | Yes          | 20                     | 10.5                   | 1895.37        |
      | PROH    | 2016-04-01  | 110516/002       |                          | 600            | 10             | 30               | No           | 20                     | 10.5                   | 670.50         |
      | APPA    | 2016-04-01  | 121019/003       |                          | 40             | 10             | 30               | Yes          | 20                     | 15.5                   | 131.50         |
      | APPA    | 2022-09-30  | 121022/004       |                          | 50             | 10             | 30               | No           | 20                     | 15.5                   | 125.50         |
      | APPB    | 2022-09-30  | 131224/005       |                          | 90             | 10             | 30               | Yes          | 20                     | 10.5                   | 186.50         |
      | APPB    | 2016-04-01  | 020416/006       |                          | 40             | 10             | 30               | No           | 20                     | 10.5                   | 110.50         |


    @immigration_and_asylum_fixed_fee
    Examples: Immigration and Asylum Fixed Fee
      | feeCode | startDate  | immigrationPriorAuthorityNumber| detentionTravelAndWaitingCosts | jrFormFilling | boltOnHomeOfficeInterview | boltOnAdjournedHearing | boltOnCmrhOral | boltOnCmrhTelephone  | boltOnSubstantiveHearing | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal |
      | IACA    | 2013-04-01 |                                | 50                             | 100           |                           |                        | 4              | 5                    |                          | Yes          | 20                    | 10.5                  | 1819.70       |
      | IACA    | 2020-06-08 | 111                            | 50                             | 100           |                           |                        | 9              | 1                    |                          | No           | 601                   | 10.5                  | 2572.50       |
      | IACA    | 2023-03-31 |                                | 50                             | 100           |                           |                        | 2              | 4                    |                          | Yes          | 599                   | 15.5                  | 1897.30       |
      | IACB    | 2013-04-01 |                                | 50                             | 100           |                           | 3                      | 6              | 8                    |                          | No           | 20                    | 15.5                  | 3253.50       |
      | IACB    | 2020-06-08 |                                | 50                             | 100           |                           | 1                      | 2              | 3                    |                          | Yes          | 599                   | 10.5                  | 2747.90       |
      | IACB    | 2023-03-31 |                                | 50                             | 100           |                           | 4                      | 4              | 7                    |                          | No           | 599                   | 10.5                  | 3566.50       |
      | IACC    | 2020-06-08 |                                | 50                             | 100           |                           | 4                      | 3              | 2                    |                          | Yes          | 20                    | 15.5                  | 2916.70       |
      | IACC    | 2023-03-31 | 111                            | 50                             | 100           |                           | 5                      | 6              | 7                    |                          | No           | 601                   | 15.5                  | 4126.50       |
      | IACC    | 2021-01-01 |                                | 50                             | 100           |                           | 3                      | 7              | 4                    |                          | Yes          | 599                   | 10.5                  | 4310.30       |
      | IACE    | 2023-04-01 |                                | 50                             | 100           |                           |                        | 1              | 2                    |                          | No           | 20                    | 10.5                  | 1195.50       |
      | IACE    | 2023-04-02 |                                | 50                             | 100           |                           |                        | 4              | 3                    |                          | Yes          | 599                   | 15.5                  | 2718.10       |
      | IACE    | 2025-04-02 |                                | 50                             | 100           |                           |                        | 5              | 6                    |                          | No           | 599                   | 15.5                  | 2803.50       |
      | IACF    | 2023-04-01 | 111                            | 50                             | 100           |                           | 7                      | 6              | 5                    |                          | Yes          | 601                   | 10.5                  | 5452.30       |
      | IACF    | 2023-04-02 |                                | 50                             | 100           |                           | 8                      | 9              | 1                    |                          | No           | 599                   | 10.5                  | 4942.50       |
      | IACF    | 2025-04-02 |                                | 50                             | 100           |                           | 2                      | 3              | 4                    |                          | Yes          | 599                   | 15.5                  | 3783.70       |
      | IALB    | 2013-04-01 |                                | 50                             | 100           | 1                         |                        |                |                      |                          | No           | 20                    | 15.5                  | 864.50        |
      | IALB    | 2020-06-08 | 111                            | 50                             | 100           | 2                         |                        |                |                      |                          | Yes          | 401                   | 10.5                  | 1725.50       |
      | IALB    | 2023-04-01 |                                | 50                             | 100           | 3                         |                        |                |                      |                          | No           | 399                   | 10.5                  | 1770.50       |
      | IMCA    | 2013-04-01 |                                | 50                             | 100           |                           |                        | 4              | 4                    |                          | Yes          | 20                    | 15.5                  | 1716.70       |
      | IMCA    | 2020-06-08 | 111                            | 50                             | 100           |                           |                        | 5              | 6                    |                          | No           | 601                   | 15.5                  | 2363.50       |
      | IMCA    | 2023-03-31 |                                | 50                             | 100           |                           |                        | 7              | 8                    |                          | Yes          | 599                   | 10.5                  | 3320.30       |
      | IMCB    | 2013-04-01 |                                | 50                             | 100           |                           | 1                      | 9              | 9                    |                          | No           | 20                    | 10.5                  | 3336.50       |
      | IMCB    | 2020-06-08 |                                | 50                             | 100           |                           | 2                      | 8              | 1                    |                          | Yes          | 599                   | 15.5                  | 3711.70       |
      | IMCB    | 2023-03-31 |                                | 50                             | 100           |                           | 3                      | 8              | 2                    |                          | No           | 599                   | 15.5                  | 3446.50       |
      | IMCC    | 2020-06-08 |                                | 50                             | 100           |                           | 4                      | 8              | 3                    |                          | Yes          | 20                    | 10.5                  | 3817.70       |
      | IMCC    | 2023-03-31 | 111                            | 50                             | 100           |                           | 5                      | 8              | 4                    |                          | No           | 601                   | 10.5                  | 4018.50       |
      | IMCC    | 2021-01-01 |                                | 50                             | 100           |                           | 6                      | 7              | 5                    |                          | Yes          | 599                   | 15.5                  | 4804.90       |
      | IMCE    | 2023-04-01 |                                | 50                             | 100           |                           |                        | 6              | 6                    |                          | No           | 20                    | 15.5                  | 2349.50       |
      | IMCE    | 2023-04-02 |                                | 50                             | 100           |                           |                        | 5              | 7                    |                          | Yes          | 599                   | 10.5                  | 3295.10       |
      | IMCE    | 2025-04-02 |                                | 50                             | 100           |                           |                        | 4              | 8                    |                          | No           | 599                   | 10.5                  | 2771.50       |
      | IMCF    | 2023-04-01 |                                | 50                             | 100           |                           | 7                      | 3              | 9                    |                          | Yes          | 20                    | 15.5                  | 4447.90       |
      | IMCF    | 2023-04-02 | 111                            | 50                             | 100           |                           | 8                      | 2              | 7                    |                          | No           | 601                   | 15.5                  | 4108.50       |
      | IMCF    | 2025-04-02 |                                | 50                             | 100           |                           | 9                      | 1              | 5                    |                          | Yes          | 599                   | 10.5                  | 4577.90       |
      | IMLB    | 2013-04-01 |                                | 50                             | 100           | 1                         |                        |                |                      |                          | No           | 20                    | 10.5                  | 680.50        |
      | IMLB    | 2020-06-08 | 111                            | 50                             | 100           | 2                         |                        |                |                      |                          | Yes          | 401                   | 15.5                  | 1515.70       |
      | IMLB    | 2023-04-01 |                                | 50                             | 100           | 3                         |                        |                |                      |                          | No           | 399                   | 15.5                  | 1596.50       |
      | IDAS1   | 2013-04-01 |                                | 50                             | 100           |                           |                        |                |                      |                          | Yes          | 20                    | 10.5                  | 426.50        |
      | IDAS1   | 2020-06-08 |                                | 50                             | 100           |                           |                        |                |                      |                          | No           | 20                    | 10.5                  | 360.50        |
      | IDAS1   | 2023-04-01 |                                | 50                             | 100           |                           |                        |                |                      |                          | Yes          | 20                    | 15.5                  | 431.50        |
      | IDAS2   | 2013-04-01 |                                | 50                             | 100           |                           |                        |                |                      |                          | No           | 20                    | 15.5                  | 545.50        |
      | IDAS2   | 2020-06-08 |                                | 50                             | 100           |                           |                        |                |                      |                          | Yes          | 20                    | 10.5                  | 642.50        |
      | IDAS2   | 2023-04-01 |                                | 50                             | 100           |                           |                        |                |                      |                          | No           | 20                    | 10.5                  | 540.50        |


    @immigration_and_asylum_hourly_rate_LH
    Examples: Immigration and Asylum Hourly Rate Legal Help
      | feeCode | startDate  | netProfitCosts | immigrationPriorAuthorityNumber  | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal |
      | IAXL    | 2013-04-01 | 799            |                                  | Yes          | 399                   | 10.5                  | 1368.30       |
      | IAXL    | 2013-04-02 | 800            |                                  | No           | 400                   | 10.5                  | 1210.50       |
      | IAXL    | 2025-04-03 | 801            | 111                              | Yes          | 401                   | 15.5                  | 1377.70       |
      | IAXL    | 2013-04-01 | 900            | 111                              | No           | 500                   | 15.5                  | 1415.50       |
      | IMXL    | 2013-04-01 | 499            |                                  | Yes          | 399                   | 10.5                  | 1008.30       |
      | IMXL    | 2013-04-02 | 500            |                                  | No           | 400                   | 10.5                  | 910.50        |
      | IMXL    | 2025-04-03 | 501            | 111                              | Yes          | 401                   | 15.5                  | 1017.70       |
      | IMXL    | 2013-04-01 | 700            | 111                              | No           | 500                   | 15.5                  | 1215.50       |
      | IA100   | 2013-04-01 | 99             |                                  | Yes          |                       | 10.5                  | 129.30        |
      | IA100   | 2013-04-02 | 100            |                                  | No           |                       | 10.5                  | 110.50        |

    @immigration_and_asylum_hourly_rate_CLR
    Examples: Immigration and Asylum Hourly Rate CLR
      | feeCode | startDate  | netProfitCosts | immigrationPriorAuthorityNumber | netCostOfCounsel  | detentionTravelAndWaitingCosts | jrFormFilling | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal |
      | IAXC    | 2013-04-01 | 500            |                                  | 500              | 50                             | 100           | Yes          | 600                   | 10.5                  | 1810.50       |
      | IAXC    | 2013-04-02 | 499            |                                  | 500              |                                | 100           | No           | 600                   | 10.5                  | 1609.50       |
      | IAXC    | 2025-04-03 | 600            | 111                              | 600              | 50                             |               | Yes          | 600                   | 15.5                  | 2055.50       |
      | IMXC    | 2013-04-01 | 400            |                                  | 400              | 50                             | 100           | No           | 399                   | 15.5                  | 1214.50       |
      | IMXC    | 2013-04-02 | 400            |                                  | 400              |                                | 100           | Yes          | 400                   | 10.5                  | 1370.50       |
      | IMXC    | 2025-04-03 | 500            | 111                              | 600              | 50                             |               | No           | 700                   | 10.5                  | 1810.50       |
      | IRAR    | 2013-04-01 | 10000          |                                  | 1000             | 50                             | 100           | Yes          | 500                   | 15.5                  | 13715.50      |
      | IRAR    | 2013-04-02 | 100000         |                                  | 20000            | 50                             | 100           | No           | 900                   | 15.5                  | 120915.50     |
      | IRAR    | 2025-04-03 | 50             |                                  | 100000           |                                | 100           | Yes          | 1000                  | 10.5                  | 121070.50     |

    @immigration_and_asylum_hourly_rate_CLR_interim
    Examples: Immigration & Asylum Disbursement-Based Calculations
      | feeCode | startDate  | netProfitCosts | immigrationPriorAuthorityNumber| netCostOfCounsel | detentionTravelAndWaitingCosts | jrFormFilling | boltOnHomeOfficeInterview | boltOnAdjournedHearing  | boltOnCmrhOral | boltOnCmrhTelephone | boltOnSubstantiveHearing | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal |
      | IACD    | 2020-06-08 | 500            |                                | 500              |                                |               |                           | 1                       | 4              | 5                   | 5                        | Yes          | 600                   | 10.5                  | 3702.90       |
      | IACD    | 2023-03-31 | 499            |                                | 500              |                                |               |                           | 2                       | 9              | 1                   | 9                        | No           | 600                   | 10.5                  | 3817.50       |
      | IACD    | 2021-01-01 | 750            | 111                            | 600              |                                |               |                           | 3                       | 2              | 4                   | 6                        | Yes          | 600                   | 15.5                  | 4007.90       |
      | IACD    | 2022-01-01 | 350            |                                | 400              |                                |               |                           | 1                       | 2              | 3                   | 5                        | No           | 399                   | 15.5                  | 2229.50       |
      | IMCD    | 2020-06-08 | 400            |                                | 400              |                                |               |                           | 4                       | 8              | 7                   | 5                        | Yes          | 400                   | 10.5                  | 4777.30       |
      | IMCD    | 2023-03-31 | 399            | 111                            | 600              |                                |               |                           | 4                       | 3              | 2                   | 1                        | No           | 700                   | 10.5                  | 3268.50       |
      | IMCD    | 2021-01-01 | 600            |                                | 100              |                                |               |                           | 3                       | 7              | 4                   | 9                        | Yes          | 500                   | 15.5                  | 4045.90       |
      | IMCD    | 2022-01-01 | 150            |                                | 100              |                                |               |                           | 4                       | 1              | 2                   | 7                        | No           | 900                   | 15.5                  | 2392.50       |


    @disbursements_only
    Examples: Disbursements Only
      | feeCode | startDate  | immigrationPriorAuthorityNumber| netDisbursementAmount | disbursementVatAmount | expectedTotal |
      | ICASD   | 2013-04-01 |                                | 1600                  | 10.5                  | 1610.50       |
      | ICASD   | 2013-04-01 |                                | 1599                  | 10.5                  | 1609.50       |
      | ICASD   | 2013-04-01 | 111                            | 2500                  | 15.5                  | 2515.50       |
      | ICISD   | 2013-04-01 |                                | 1200                  | 15.5                  | 1215.50       |
      | ICISD   | 2013-04-01 |                                | 1199                  | 10.5                  | 1209.50       |
      | ICISD   | 2013-04-01 | 111                            | 1800                  | 10.5                  | 1810.50       |
      | ICSSD   | 2013-04-01 |                                | 600                   | 15.5                  | 615.50        |
      | ICSSD   | 2013-04-01 |                                | 599                   | 15.5                  | 614.50        |
      | ICSSD   | 2013-04-01 | 111                            | 900                   | 10.5                  | 910.50        |
      | ILHSD   | 2013-04-01 |                                | 400                   | 10.5                  | 410.50        |
      | ILHSD   | 2013-04-01 |                                | 399                   | 15.5                  | 414.50        |
      | ILHSD   | 2013-04-01 | 111                            | 700                   | 15.5                  | 715.50        |
      | MHLDIS  | 2013-04-01 |                                | 4000                  | 10.5                  | 4010.50       |
      | MHLDIS  | 2013-04-01 |                                | 10000                 | 10.5                  | 10010.50      |
      | MHLDIS  | 2013-04-01 |                                | 70000                 | 15.5                  | 70015.50      |
      | EDUDIS  | 2013-04-01 |                                | 500                   | 6000                  | 6500.00       |
      | EDUDIS  | 2013-04-01 |                                | 200                   | 890                   | 1090.00       |
      | EDUDIS  | 2013-04-01 |                                | 56000                 | 10.5                  | 56010.50      |

    @sending_hearing
    Examples: CL Sending Hearing FF
      | feeCode  | startDate  | uniqueFileNumber  | representationOrderDate |netTravelCosts| netWaitingCosts  | netDisbursementAmount | disbursementVatAmount | vatIndicator | numberOfMediationSessions | boltOnAdjournedHearing | expectedTotal |
      | PROW     | 2020-10-19 | 110516/001        | 2020-10-19              |0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 248.18        |
      | PROW     | 2020-10-19 | 110516/002        | 2021-10-19              |0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 211.90        |
      | PROW     | 2020-10-19 | 121019/003        | 2022-09-29              |0             | 0                | 20                    | 15.50                 | true         | 0                         | 0                      | 253.18        |
      | PROW     | 2022-09-30 | 121022/004        | 2022-09-30              |0             | 0                | 20                    | 15.50                 | false        | 0                         | 0                      | 244.11        |
      | PROW     | 2022-09-30 | 131224/005        | 2023-09-30              |0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 280.83        |
      | PROW     | 2022-09-30 | 020416/006        | 2025-01-01              |0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 239.11        |

    @early_cover_refused_means
    Examples: Early Cover or Refused Means Test
      | feeCode  | startDate  | uniqueFileNumber  | representationOrderDate |netTravelCosts| netWaitingCosts  | netDisbursementAmount | disbursementVatAmount | vatIndicator | numberOfMediationSessions | boltOnAdjournedHearing | expectedTotal |
      | PROT     | 2016-04-01 | 010416/001        |                         |0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 82.13         |
      | PROT     | 2022-09-30 | 300922/002        |                         |0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 78.71         |
      | PROT     | 2022-09-30 | 290922/003        |                         |0             | 0                | 20                    | 15.50                 | true         | 0                         | 0                      | 82.13         |
      | PROU     | 2016-04-01 | 010416/004        |                         |0             | 0                | 20                    | 15.50                 | false        | 0                         | 0                      | 22.81         |
      | PROU     | 2022-09-30 | 300922/005        |                         |0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 31.48         |
      | PROU     | 2022-09-30 | 290922/006        |                         |0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 22.81         |

    @prod
    Examples: PROD (Advocacy Assistance)
      | feeCode | caseConcludedDate | uniqueFileNumber | representationOrderDate | netProfitCosts | netTravelCosts | netWaitingCosts | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal |
      | PROD    | 2020-10-19        | 010416/001       | 2020-10-19              | 1000           | 800            | 8000            | Yes          | 20                    | 10.5                  | 11790.50      |
      | PROD    | 2020-10-19        | 300922/002       | 2021-10-19              | 60000          |                | 0               | No           | 20                    | 10.5                  | 60030.50      |
      | PROD    | 2020-10-19        | 290922/003       | 2022-09-29              | 200            | 5000           | 600             | Yes          | 20                    | 15.5                  | 6995.50       |
      | PROD    | 2022-09-30        |                  |                         | 3209.54        | 499            | 323             | No           | 20                    | 15.5                  | 4067.04       |
      | PROD    | 2022-09-30        | 300922/005       |                         | 1200           | 566            | 788             | Yes          | 20                    | 10.5                  | 3095.30       |
      | PROD    | 2022-09-30        |                  |                         | 1600           | 40000          | 80000           | No           | 20                    | 10.5                  | 121630.50     |


    @pre_order_cover
    Examples: Pre Order Cover
      | feeCode | startDate  | uniqueFileNumber | netProfitCosts | netTravelCosts | netWaitingCosts | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal |
      | PROP1   | 2016-04-01 | 110516/001       | 5              | 10             | 2               | Yes          | 20                    | 10.5                  | 50.90         |
      | PROP1   | 2022-09-30 | 290922/002       | 10             | 0              | 3               | No           | 20                    | 10.5                  | 43.50         |
      | PROP1   | 2022-09-30 | 161223/003       | 3              | 2              | 0               | Yes          | 20                    | 15.5                  | 41.50         |
      | PROP2   | 2016-04-01 | 020416/004       | 5              | 10             | 2               | No           | 20                    | 15.5                  | 52.50         |
      | PROP2   | 2022-09-30 | 290922/005       | 10             | 0              | 3               | Yes          | 20                    | 10.5                  | 46.10         |
      | PROP2   | 2022-09-30 | 161224/006       | 3              | 2              | 0               | No           | 20                    | 10.5                  | 35.50         |

