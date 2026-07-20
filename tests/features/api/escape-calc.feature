Feature: Escape Fee Calculation API

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

    @esc_prison_law
    Examples: Prison Law (Escape and fee limit cases)
      | feeCode | startDate  | uniqueFileNumber | netProfitCosts | netTravelCosts | netWaitingCosts | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal | escapeCaseFlag |
      | PRIA    | 2016-04-01 | 110516/001       | 310            | 10             | 310             | Yes          | 20                    | 10.5                  | 264.90| TRUE           |
      | PRIA    | 2016-04-01 | 110516/001       | 300            | 3              | 300             | Yes          | 20                    | 10.5                  | 264.90| FALSE          |
      | PRIB2   | 2016-04-01 | 110516/002       | 1000           |                | 691.70          | No           | 20                    | 10.5                  | 588.16| TRUE           |
      | PRIB2   | 2016-04-01 | 110516/002       | 691.69         | 5              | 999             | No           | 20                    | 10.5                  | 588.16| FALSE          |
      | PRIC2   | 2016-04-01 | 121022/003       | 2000           |                | 2362.55         | Yes          | 20                    | 10.5                  | 1769.33| TRUE           |
      | PRIC2   | 2016-04-01 | 121022/003       | 1999           | 5              | 2362.54         | Yes          | 20                    | 10.5                  | 1769.33| FALSE          |
      | PRID2   | 2016-04-01 | 121022/004       | 1000           |                | 691.70          | No           | 20                    | 10.5                  | 588.16| TRUE           |
      | PRID2   | 2016-04-01 | 121022/004       | 691.69         | 5              | 999             | No           | 20                    | 10.5                  | 588.16| FALSE          |
      | PRIE2   | 2016-04-01 | 131224/005       | 2000           |                | 2362.55         | Yes          | 20                    | 10.5                  | 1769.33| TRUE           |
      | PRIE2   | 2016-04-01 | 131224/005       | 1999           | 5              | 2362.54         | Yes          | 20                    | 10.5                  | 1769.33| FALSE          |
      | PRIB1   | 2016-04-01 | 131224/006       | 200            |                | 157.06          | No           | 20                    | 10.5                  | 227.93| FALSE          |
      | PRIB1   | 2016-04-01 | 131224/006       | 400            | 10             | 0               | No           | 20                    | 10.5                  | 227.93| FALSE          |
      | PRIC1   | 2016-04-01 | 110516/001       | 500            |                | 433.93          | Yes          | 20                    | 10.5                  | 548.65| FALSE          |
      | PRIC1   | 2016-04-01 | 110516/001       | 0              | 10             | 950             | Yes          | 20                    | 10.5                  | 548.65| FALSE          |
      | PRID1   | 2016-04-01 | 110516/002       | 200            |                | 157.06          | No           | 20                    | 10.5                  | 227.93| FALSE          |
      | PRID1   | 2016-04-01 | 110516/002       | 400            | 10             | 0               | No           | 20                    | 10.5                  | 227.93| FALSE          |
      | PRIE1   | 2016-04-01 | 020416/003       | 500            |                | 433.93          | Yes          | 20                    | 10.5                  | 548.65| FALSE          |
      | PRIE1   | 2016-04-01 | 020416/003       | 0              | 10             | 950             | Yes          | 20                    | 10.5                  | 548.65| FALSE          |

    @esc_police_station_work
    Examples: Police Station Work Escape cases
      | feeCode | startDate  | uniqueFileNumber | policeStationId | policeStationSchemeId | netProfitCosts | netTravelCosts | netWaitingCosts | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal | escapeCaseFlag |
      | INVC    | 2016-04-01 | 110516/001       | NE001           | 1001                  | 200            | 100.00         | 105.41          | Yes          | 20                    | 10.5                  | 181.68| TRUE           |
      | INVC    | 2016-04-01 | 110516/002       | NE003           | 1001                  | 200            | 100.00         | 117.04          | No           | 20                    | 10.5                  | 159.96| TRUE           |
      | INVC    | 2022-09-30 | 121022/003       | NE016           | 1004                  | 300            | 100.00         | 138.53          | Yes          | 20                    | 15.5                  | 234.30| TRUE           |
      | INVC    | 2022-09-30 | 121022/004       | NE041           | 1010                  | 200            | 100.00         | 195.68          | No           | 20                    | 15.5                  | 185.61| TRUE           |
      | INVC    | 2024-12-06 | 131224/005       | RD052           | 1141                  | 400            | 326.10         |                 | Yes          | 20                    | 15.5                  | 314.44| TRUE           |
      | INVC    | 2024-12-06 | 131224/006       | RD091           | 1142                  | 300            |                | 289             | No           | 20                    | 15.5                  | 247.52| TRUE           |

    @esc_assoc_civil_work
    Examples: Associated Civil Work Escape cases
      | feeCode | startDate  | uniqueFileNumber | netProfitCosts | netTravelCosts | netWaitingCosts | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal | escapeCaseFlag |
      | ASMS    | 2016-04-01 | 110516/001       | 100            | 100            | 38              | Yes          | 20                    | 10.5                  | 118.80| TRUE           |
      | ASMS    | 2016-04-01 | 110516/002       | 100            | 138            |                 | No           | 20                    | 10.5                  | 103.00| TRUE           |
      | ASPL    | 2016-04-01 | 121022/003       | 300            | 200            | 278             | Yes          | 20                    | 15.5                  | 334.80| TRUE           |
      | ASPL    | 2016-04-01 | 121022/004       | 500            |                | 278             | No           | 20                    | 15.5                  | 283.00| TRUE           |
      | ASAS    | 2016-04-01 | 131224/005       | 100            | 200            | 172             | Yes          | 20                    | 15.5                  | 212.40| TRUE           |
      | ASAS    | 2016-04-01 | 131224/006       |                | 200            | 272             | No           | 20                    | 15.5                  | 181.00| TRUE           |

    @esc_mental_health
    Examples: Mental Health Escape cases
      | feeCode | startDate  | netProfitCosts | netCostOfCounsel | boltOnAdjournedHearing | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal | escapeCaseFlag |
      | MHL01   | 2013-04-01 | 400            | 359.01           |                        | No           | 20                    | 2.00                  | 275.00        | TRUE           |
      | MHL02   | 2013-04-01 | 317            | 187.01           | 1                      | Yes          | 20                    | 2.00                  | 317.20        | TRUE           |
      | MHL03   | 2013-04-01 | 1234           | 350.01           | 2                      | No           | 20                    | 2.00                  | 706.00        | TRUE           |
      | MHL04   | 2013-04-01 | 3053           | 232.01           | 9                      | Yes          | 20                    | 2.00                  | 2178.40       | TRUE           |
      | MHL05   | 2013-04-01 | 1368           | 63.01            | 4                      | No           | 20                    | 2.00                  | 811.00        | TRUE           |
      | MHL06   | 2013-04-01 | 2385           | 45.01            | 5                      | Yes          | 20                    | 2.00                  | 1462.00       | TRUE           |
      | MHL07   | 2013-04-01 | 82.01          | 1151.00          | 3                      | No           | 20                    | 2.00                  | 667.00        | TRUE           |
      | MHL08   | 2013-04-01 | 269.01         | 1468.00          | 4                      | Yes          | 20                    | 2.00                  | 1091.20       | TRUE           |

    @esc_other_civil
    Examples: Other Civil Escape cases
      | feeCode   | startDate  | netProfitCosts | netCostOfCounsel | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal | escapeCaseFlag |
      | COM       | 2013-04-01 | 798.01         | 5                | Yes          | 20                    | 2.00                  | 341.20        | TRUE           |
      | CAPA      | 2013-04-01 | 717.01         |                  | No           | 20                    | 2.00                  | 261.00        | TRUE           |
      | CLIN      | 2013-04-01 | 585.01         |                  | Yes          | 20                    | 2.00                  | 256.00        | TRUE           |
      | DEBT      | 2013-04-01 | 540.01         |                  | No           | 20                    | 2.00                  | 202.00        | TRUE           |
      | EDUFIN    | 2013-04-01 | 816.01         |                  | Yes          | 20                    | 2.00                  | 348.40        | TRUE           |
      | ELA       | 2024-09-01 | 471.01         | 5                | No           | 20                    | 2.00                  | 179.00        | TRUE           |
      | HOUS      | 2013-04-01 | 471.01         |                  | Yes          | 20                    | 2.00                  | 210.40        | TRUE           |
      | MISCGEN   | 2013-04-01 | 237.01         |                  | No           | 20                    | 2.00                  | 101.00        | TRUE           |
      | MISCCON   | 2013-04-01 | 477.01         |                  | Yes          | 20                    | 2.00                  | 212.80        | TRUE           |
      | MISCPI    | 2013-04-01 | 609.01         | 5                | No           | 20                    | 2.00                  | 225.00        | TRUE           |
      | MISCASBI  | 2015-03-23 | 471.01         |                  | Yes          | 20                    | 2.00                  | 210.40        | TRUE           |
      | MISCEMP   | 2013-04-01 | 621.01         |                  | No           | 20                    | 2.00                  | 229.00        | TRUE           |
      | PUB       | 2013-04-01 | 777.01         |                  | Yes          | 20                    | 2.00                  | 332.80        | TRUE           |
      | WFB1      | 2025-05-01 | 624.01         |                  | No           | 20                    | 2.00                  | 230.00        | TRUE           |

    @esc_family
    Examples: Family Escape cases
      | feeCode | startDate  | netProfitCosts | netCostOfCounsel | londonRate | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal | escapeCaseFlag |
      | FPB010  | 2013-04-01 | 396.01         |                  | Yes        | Yes          | 20                    | 2.00                  | 180.40        | TRUE           |
      | FPB020  | 2013-04-01 | 1095.01        |                  | No         | No           | 20                    | 2.00                  | 387.00        | TRUE           |
      | FPB030  | 2013-04-01 | 1491.01        |                  | Yes        | Yes          | 20                    | 2.00                  | 618.40        | TRUE           |
      | FVP100  | 2013-04-01 | 438.01         |                  | No         | No           | 20                    | 2.00                  | 168.00        | TRUE           |
      | FVP011  | 2013-04-01 | 258.01         |                  | No         | No           | 20                    | 2.00                  | 108.00        | TRUE           |
      | FVP013  | 2013-04-01 | 258.01         |                  | Yes        | Yes          | 20                    | 2.00                  | 125.20        | TRUE           |
      | FVP110  | 2013-04-01 | 690.01         |                  | Yes        | Yes          | 20                    | 2.00                  | 463.60        | TRUE           |
      | FVP130  | 2013-04-01 | 597.01         |                  | No         | No           | 20                    | 2.00                  | 221.00        | TRUE           |
      | FVP120  | 2013-04-01 | 723.01         |                  | Yes        | Yes          | 20                    | 2.00                  | 485.20        | TRUE           |
      | FVP140  | 2013-04-01 | 624.01         |                  | No         | No           | 20                    | 2.00                  | 230.00        | TRUE           |
      | FVP150  | 2013-04-01 | 1413.01        |                  | Yes        | Yes          | 20                    | 2.00                  | 926.80        | TRUE           |
      | FVP180  | 2013-04-01 | 1221.01        |                  | No         | No           | 20                    | 2.00                  | 429.00        | TRUE           |
      | FVP160  | 2013-04-01 | 1413.01        |                  | Yes        | Yes          | 20                    | 2.00                  | 752.80        | TRUE           |
      | FVP170  | 2013-04-01 | 1221.01        |                  | No         | No           | 20                    | 2.00                  | 554.00        | TRUE           |
      | FVP020  | 2013-04-01 | 855.01         |                  | No         | No           | 20                    | 2.00                  | 426.00        | TRUE           |
      | FVP040  | 2013-04-01 | 948.01         |                  | Yes        | Yes          | 20                    | 2.00                  | 401.20        | TRUE           |
      | FVP030  | 2013-04-01 | 882.01         |                  | No         | No           | 20                    | 2.00                  | 441.00        | TRUE           |
      | FVP050  | 2013-04-01 | 981.01         |                  | Yes        | Yes          | 20                    | 2.00                  | 414.40        | TRUE           |
      | FVP060  | 2013-04-01 | 1479.01        |                  | No         | No           | 20                    | 2.00                  | 759.00        | TRUE           |
      | FVP090  | 2013-04-01 | 1671.01        |                  | Yes        | Yes          | 20                    | 2.00                  | 690.40        | TRUE           |
      | FVP070  | 2013-04-01 | 1479.01        |                  | No         | No           | 20                    | 2.00                  | 634.00        | TRUE           |
      | FVP080  | 2013-04-01 | 1671.01        |                  | Yes        | Yes          | 20                    | 2.00                  | 864.40        | TRUE           |
      | FVP021  | 2013-04-01 | 855.01         |                  | No         | No           | 20                    | 2.00                  | 426.00        | TRUE           |
      | FVP041  | 2013-04-01 | 948.01         |                  | Yes        | Yes          | 20                    | 2.00                  | 401.20        | TRUE           |
      | FVP031  | 2013-04-01 | 882.01         |                  | No         | No           | 20                    | 2.00                  | 441.00        | TRUE           |
      | FVP051  | 2013-04-01 | 981.01         |                  | Yes        | Yes          | 20                    | 2.00                  | 414.40        | TRUE           |
      | FVP061  | 2013-04-01 | 1479.01        |                  | No         | No           | 20                    | 2.00                  | 759.00        | TRUE           |
      | FVP091  | 2013-04-01 | 1671.01        |                  | Yes        | Yes          | 20                    | 2.00                  | 690.40        | TRUE           |
      | FVP071  | 2013-04-01 | 1479.01        |                  | No         | No           | 20                    | 2.00                  | 634.00        | TRUE           |
      | FVP081  | 2013-04-01 | 1671.01        |                  | Yes        | Yes          | 20                    | 2.00                  | 864.40        | TRUE           |

    @esc_discrimination
    Examples: Discrimination Escape cases
      | feeCode | startDate  | netProfitCosts | netCostOfCounsel | travelAndWaitingCosts | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal | escapeCaseFlag |
      | DISC    | 2013-04-01 | 400            | 300.01           | 100                   | Yes          | 20                    | 2.00                  | 862.00        | TRUE           |
      | DISC    | 2013-04-01 | 301            | 399.01           |                       | No           | 20                    | 2.00                  | 722.00        | TRUE           |
      | DISC    | 2013-04-01 |                | 700.01           |                       | Yes          | 20                    | 2.00                  | 862.00        | TRUE           |
      | DISC    | 2013-04-01 | 700.01         |                  |                       | No           | 20                    | 2.00                  | 722.00        | TRUE           |


    @esc_immigration_and_asylum_fixed_fee
    Examples: Immigration and Asylum Fixed Fee Escape cases
      | feeCode | startDate  | netProfitCosts | netCostOfCounsel | immigrationPriorAuthorityNumber| detentionTravelAndWaitingCosts | jrFormFilling | boltOnHomeOfficeInterview | boltOnAdjournedHearing | boltOnCmrhOral | boltOnCmrhTelephone  | boltOnSubstantiveHearing | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal | escapeCaseFlag |
      | IACA    | 2013-04-01 | 1300.00        | 149.01           |                                | 50                             | 100           |                           |                        | 3              | 3                    |                          | Yes          | 20                    | 4.0                   | 1398.00       | TRUE           |
      | IACA    | 2020-06-08 | 1000.00        | 27.01            | 111                            | 50                             | 100           |                           |                        | 1              | 2                    |                          | No           | 601                   | 10.5                  | 1334.50       | TRUE           |
      | IACA    | 2023-03-31 | 1000.00        | 103.01           |                                | 50                             | 100           |                           |                        | 2              | 1                    |                          | Yes          | 599                   | 15.5                  | 1573.30       | TRUE           |
      | IACB    | 2013-04-01 | 2602.00        | 562.01           |                                | 50                             | 100           |                           | 3                      | 3              | 2                    |                          | No           | 20                    | 4.0                   | 2204.00       | TRUE           |
      | IACB    | 2020-06-08 | 2402.00        | 525.01           |                                | 50                             | 100           |                           | 2                      | 2              | 3                    |                          | Yes          | 599                   | 10.5                  | 2941.10       | TRUE           |
      | IACB    | 2023-03-31 | 2402.00        | 696.01           |                                | 50                             | 100           |                           | 1                      | 4              | 3                    |                          | No           | 599                   | 10.5                  | 2723.50       | TRUE           |
      | IACC    | 2020-06-08 | 2902.00        | 120.01           |                                |                                | 100           |                           | 1                      | 3              | 2                    |                          | Yes          | 20                    | 4.0                   | 2265.60       | TRUE           |
      | IACC    | 2023-03-31 | 3302.00        | 454.01           | 111                            | 50                             | 100           |                           | 5                      | 3              | 3                    |                          | No           | 601                   | 15.5                  | 3268.50       | TRUE           |
      | IACC    | 2021-01-01 | 1402.00        | 1686.01          |                                | 50                             | 100           |                           | 3                      | 2              | 1                    |                          | Yes          | 599                   | 10.5                  | 2990.30       | TRUE           |
      | IACE    | 2023-04-01 | 1100.00        | 584.01           |                                | 50                             | 100           |                           |                        | 1              | 2                    |                          | No           | 20                    | 4.0                   | 1189.00       | TRUE           |
      | IACE    | 2023-04-02 | 1267.99        | 582.02           |                                | 50                             | 100           |                           |                        | 2              | 2                    |                          | Yes          | 599                   | 15.5                  | 2211.70       | TRUE           |
      | IACE    | 2025-04-02 | 1110.00        | 1328.01          |                                | 50                             | 100           |                           |                        | 5              | 3                    |                          | No           | 599                   | 15.5                  | 2533.50       | TRUE           |
      | IACF    | 2023-04-01 | 2402.00        | 1188.01          | 111                            | 50                             | 100           |                           | 2                      | 3              | 5                    |                          | Yes          | 601                   | 10.5                  | 3888.70       | TRUE           |
      | IACF    | 2023-04-02 | 1302.00        | 1596.01          |                                | 50                             | 100           |                           | 2                      | 1              | 1                    |                          | No           | 599                   | 10.5                  | 2648.50       | TRUE           |
      | IACF    | 2025-04-02 | 1302.00        | 1871.01          |                                | 50                             | 100           |                           | 1                      | 2              | 4                    |                          | Yes          | 599                   | 15.5                  | 3391.30       | TRUE           |
      | IALB    | 2013-04-01 | 1505.01        |                  |                                | 50                             | 100           | 1                         |                        |                |                      |                          | No           | 20                    | 4.0                   | 853.00        | TRUE           |
      | IALB    | 2020-06-08 | 1771.01        |                  | 111                            | 50                             | 100           | 2                         |                        |                |                      |                          | Yes          | 401                   | 10.5                  | 1725.50       | TRUE           |
      | IALB    | 2023-04-01 | 1624.01        |                  |                                | 50                             | 100           | 3                         |                        |                |                      |                          | No           | 399                   | 10.5                  | 1770.50       | TRUE           |
      | IMCA    | 2013-04-01 | 1200.00        | 505.01           |                                | 50                             | 100           |                           |                        | 4              | 4                    |                          | Yes          | 20                    | 4.0                   | 1705.20       | TRUE           |
      | IMCA    | 2020-06-08 | 1400.00        | 651.01           | 111                            | 50                             | 100           |                           |                        | 5              | 6                    |                          | No           | 601                   | 15.5                  | 2363.50       | TRUE           |
      | IMCA    | 2023-03-31 | 1000.00        | 193.01           |                                | 50                             | 100           |                           |                        | 2              | 2                    |                          | Yes          | 599                   | 10.5                  | 1676.30       | TRUE           |
      | IMCB    | 2013-04-01 | 2137.00        | 40.01            |                                | 50                             | 100           |                           | 2                      | 1              | 1                    |                          | No           | 20                    | 4.0                   | 1443.00       | TRUE           |
      | IMCB    | 2020-06-08 | 2237.00        | 272.01           |                                | 50                             | 100           |                           | 2                      | 3              | 1                    |                          | Yes          | 599                   | 15.5                  | 2715.70       | TRUE           |
      | IMCB    | 2023-03-31 | 2237.00        | 812.01           |                                | 50                             | 100           |                           | 2                      | 3              | 7                    |                          | No           | 599                   | 15.5                  | 2905.50       | TRUE           |
      | IMCC    | 2020-06-08 | 2237.00        | 903.01           |                                | 50                             | 100           |                           | 4                      | 3              | 2                    |                          | Yes          | 20                    | 4.0                   | 2707.20       | TRUE           |
      | IMCC    | 2023-03-31 | 2737.00        | 564.01           | 111                            | 50                             | 100           |                           | 5                      | 3              | 2                    |                          | No           | 601                   | 10.5                  | 3008.50       | TRUE           |
      | IMCC    | 2021-01-01 | 2737.00        | 185.01           |                                | 50                             | 100           |                           | 2                      | 2              | 5                    |                          | Yes          | 599                   | 15.5                  | 3036.10       | TRUE           |
      | IMCE    | 2023-04-01 | 1700.00        | 68.01            |                                | 50                             | 100           |                           |                        | 2              | 2                    |                          | No           | 20                    | 4.0                   | 1314.00       | TRUE           |
      | IMCE    | 2023-04-02 | 2200.00        | 156.01           |                                | 50                             | 100           |                           |                        | 5              | 3                    |                          | Yes          | 599                   | 10.5                  | 2863.10       | TRUE           |
      | IMCE    | 2025-04-02 | 1700.00        | 68.01            |                                | 50                             | 100           |                           |                        | 2              | 2                    |                          | No           | 599                   | 10.5                  | 1899.50       | TRUE           |
      | IMCF    | 2023-04-01 | 2837.00        | 20.01            |                                | 50                             | 100           |                           | 2                      | 3              | 1                    |                          | Yes          | 20                    | 4.0                   | 2606.40       | TRUE           |
      | IMCF    | 2023-04-02 | 2237.00        | 473.01           | 111                            | 50                             | 100           |                           | 1                      | 2              | 3                    |                          | No           | 601                   | 15.5                  | 2621.50       | TRUE           |
      | IMCF    | 2025-04-02 | 2237.00        | 473.01           |                                | 50                             | 100           |                           | 1                      | 2              | 3                    |                          | Yes          | 599                   | 10.5                  | 3015.50       | TRUE           |
      | IMLB    | 2013-04-01 | 968.01         |                  |                                | 50                             | 100           | 1                         | N/A                    | N/A            | N/A                  | N/A                      | No           | 20                    | 4.0                   | 674.00        | TRUE           |
      | IMLB    | 2020-06-08 | 968.01         |                  | 111                            | 50                             | 100           | 1                         | N/A                    | N/A            | N/A                  | N/A                      | Yes          | 401                   | 15.5                  | 1196.50       | TRUE           |
      | IMLB    | 2023-04-01 | 734.01         |                  |                                | 50                             | 100           | 1                         | N/A                    | N/A            | N/A                  | N/A                      | No           | 399                   | 15.5                  | 1064.50       | TRUE           |


