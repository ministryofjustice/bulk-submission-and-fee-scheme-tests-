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
      | COM       | 2013-04-01 |                |                  | Yes          | 20                    | 2.00                  | 341.20        |
      | CAPA      | 2013-04-01 |                |                  | No           | 20                    | 2.00                  | 261.00        |
      | CLIN      | 2013-04-01 |                |                  | Yes          | 20                    | 2.00                  | 256.00        |
      | DEBT      | 2013-04-01 |                |                  | No           | 20                    | 2.00                  | 202.00        |
      | EDUFIN    | 2013-04-01 |                |                  | Yes          | 20                    | 2.00                  | 348.40        |
      | ELA       | 2024-09-01 |                |                  | No           | 20                    | 2.00                  | 179.00        |
      | HOUS      | 2013-04-01 |                |                  | Yes          | 20                    | 2.00                  | 210.40        |
      | MISCGEN   | 2013-04-01 |                |                  | No           | 20                    | 2.00                  | 101.00        |
      | MISCCON   | 2013-04-01 |                |                  | Yes          | 20                    | 2.00                  | 212.80        |
      | MISCPI    | 2013-04-01 |                |                  | No           | 20                    | 2.00                  | 225.00        |
      | MISCASBI  | 2015-03-23 |                |                  | Yes          | 20                    | 2.00                  | 210.40        |
      | MISCEMP   | 2013-04-01 |                |                  | No           | 20                    | 2.00                  | 229.00        |
      | PUB       | 2013-04-01 |                |                  | Yes          | 20                    | 2.00                  | 332.80        |
      | WFB1      | 2025-05-01 |                |                  | No           | 20                    | 2.00                  | 230.00        |
      | WFB1      | 2023-04-01 |                |                  | Yes          | 20                    | 2.00                  | 271.60        |
      | WFB1      | 2025-04-30 |                |                  | No           | 20                    | 2.00                  | 230.00        |

    @welfare_benefits
    Examples: Welfare Benefits
      | feeCode | startDate  | netDisbursementAmount | disbursementVatAmount | vatIndicator | numberOfMediationSessions | boltOnAdjournedHearing | expectedTotal |
      | WFB1    | 2014-02-01 | 20                    | 2.00                 | true         | 0                         | 0                      | 271.60         |
      | WFB1    | 2025-04-30 | 20                    | 2.00                 | false        | 0                         | 0                      | 230.00         |
      | WFB1    | 2025-05-01 | 20                    | 2.00                 | true         | 0                         | 0                      | 271.60         |
      | WFB1    | 2025-05-01 | 20                    | 2.00                 | false        | 0                         | 0                      | 230.00         |


    @mediation_sg
    Examples: Mediation SG
      | feeCode  | startDate  | numberOfMediationSessions | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal |
      | ASSA     | 2013-04-01 |                           | Yes          | 20                    | 2.00                  | 126.40        |
      | ASSS     | 2013-04-01 |                           | No           | 20                    | 2.00                  | 109.00        |
      | ASST     | 2013-04-01 |                           | Yes          | 20                    | 2.00                  | 178.00        |
      | MDAS2B   | 2013-04-01 | 1                         | No           | 20                    | 2.00                  | 190.00        |
      | MDAS2B   | 2013-04-01 | 2                         | Yes          | 20                    | 2.00                  | 929.20        |
      | MDAS1B   | 2013-04-01 | 1                         | No           | 20                    | 2.00                  | 190.00        |
      | MDAS1B   | 2013-04-01 | 3                         | Yes          | 20                    | 2.00                  | 576.40        |
      | MDAC2B   | 2013-04-01 | 1                         | No           | 20                    | 2.00                  | 252.00        |
      | MDAC2B   | 2013-04-01 | 2                         | Yes          | 20                    | 2.00                  | 1298.80       |
      | MDAC1B   | 2013-04-01 | 1                         | No           | 20                    | 2.00                  | 252.00        |
      | MDAC1B   | 2013-04-01 | 4                         | Yes          | 20                    | 2.00                  | 798.40        |
      | MDAS2S   | 2013-04-01 | 1                         | No           | 20                    | 2.00                  | 442.00        |
      | MDAS2S   | 2013-04-01 | 2                         | Yes          | 20                    | 2.00                  | 1231.60       |
      | MDAS1S   | 2013-04-01 | 1                         | No           | 20                    | 2.00                  | 316.00        |
      | MDAS1S   | 2013-04-01 | 3                         | Yes          | 20                    | 2.00                  | 727.60        |
      | MDAS2P   | 2013-04-01 | 1                         | No           | 20                    | 2.00                  | 379.00        |
      | MDAS2P   | 2013-04-01 | 2                         | Yes          | 20                    | 2.00                  | 1156.00       |
      | MDAS1P   | 2013-04-01 | 1                         | No           | 20                    | 2.00                  | 284.50        |
      | MDAS1P   | 2013-04-01 | 4                         | Yes          | 20                    | 2.00                  | 689.80        |
      | MDAS2C   | 2013-04-01 | 1                         | No           | 20                    | 2.00                  | 316.00        |
      | MDAS2C   | 2013-04-01 | 2                         | Yes          | 20                    | 2.00                  | 1080.40       |
      | MDAS1C   | 2013-04-01 | 1                         | No           | 20                    | 2.00                  | 253.00        |
      | MDAS1C   | 2013-04-01 | 3                         | Yes          | 20                    | 2.00                  | 652.00        |
      | MDAC2S   | 2013-04-01 | 1                         | No           | 20                    | 2.00                  | 504.00        |
      | MDAC2S   | 2013-04-01 | 2                         | Yes          | 20                    | 2.00                  | 1601.20       |
      | MDAC1S   | 2013-04-01 | 1                         | No           | 20                    | 2.00                  | 378.00        |
      | MDAC1S   | 2013-04-01 | 4                         | Yes          | 20                    | 2.00                  | 949.60        |
      | MDAC2P   | 2013-04-01 | 1                         | No           | 20                    | 2.00                  | 441.00        |
      | MDAC2P   | 2013-04-01 | 2                         | Yes          | 20                    | 2.00                  | 1525.60       |
      | MDAC1P   | 2013-04-01 | 1                         | No           | 20                    | 2.00                  | 346.50        |
      | MDAC1P   | 2013-04-01 | 3                         | Yes          | 20                    | 2.00                  | 911.80        |
      | MDAC2C   | 2013-04-01 | 1                         | No           | 20                    | 2.00                  | 378.00        |
      | MDAC2C   | 2013-04-01 | 2                         | Yes          | 20                    | 2.00                  | 1450.00       |
      | MDAC1C   | 2013-04-01 | 1                         | No           | 20                    | 2.00                  | 315.00        |
      | MDAC1C   | 2013-04-01 | 4                         | Yes          | 20                    | 2.00                  | 874.00        |
      | MDPS2B   | 2013-04-01 | 1                         | No           | 20                    | 2.00                  | 190.00        |
      | MDPS2B   | 2013-04-01 | 2                         | Yes          | 20                    | 2.00                  | 727.60        |
      | MDPS1B   | 2013-04-01 | 1                         | No           | 20                    | 2.00                  | 190.00        |
      | MDPS1B   | 2013-04-01 | 3                         | Yes          | 20                    | 2.00                  | 475.60        |
      | MDPC2B   | 2013-04-01 | 1                         | No           | 20                    | 2.00                  | 252.00        |
      | MDPC2B   | 2013-04-01 | 2                         | Yes          | 20                    | 2.00                  | 1022.80       |
      | MDPC1B   | 2013-04-01 | 1                         | No           | 20                    | 2.00                  | 252.00        |
      | MDPC1B   | 2013-04-01 | 4                         | Yes          | 20                    | 2.00                  | 660.40        |
      | MDPS2S   | 2013-04-01 | 1                         | No           | 20                    | 2.00                  | 379.00        |
      | MDPS2S   | 2013-04-01 | 2                         | Yes          | 20                    | 2.00                  | 954.40        |
      | MDPS1S   | 2013-04-01 | 1                         | No           | 20                    | 2.00                  | 284.50        |
      | MDPS1S   | 2013-04-01 | 3                         | Yes          | 20                    | 2.00                  | 589.00        |
      | MDPC2S   | 2013-04-01 | 1                         | No           | 20                    | 2.00                  | 441.00        |
      | MDPC2S   | 2013-04-01 | 2                         | Yes          | 20                    | 2.00                  | 1249.60       |
      | MDPC1S   | 2013-04-01 | 1                         | No           | 20                    | 2.00                  | 346.50        |
      | MDPC1S   | 2013-04-01 | 4                         | Yes          | 20                    | 2.00                  | 773.80        |
      | MDCS2B   | 2013-04-01 | 1                         | No           | 20                    | 2.00                  | 190.00        |
      | MDCS2B   | 2013-04-01 | 2                         | Yes          | 20                    | 2.00                  | 576.40        |
      | MDCS1B   | 2013-04-01 | 1                         | No           | 20                    | 2.00                  | 190.00        |
      | MDCS1B   | 2013-04-01 | 3                         | Yes          | 20                    | 2.00                  | 400.00        |
      | MDCC2B   | 2013-04-01 | 1                         | No           | 20                    | 2.00                  | 252.00        |
      | MDCC2B   | 2013-04-01 | 2                         | Yes          | 20                    | 2.00                  | 798.40        |
      | MDCC1B   | 2013-04-01 | 1                         | No           | 20                    | 2.00                  | 252.00        |
      | MDCC1B   | 2013-04-01 | 4                         | Yes          | 20                    | 2.00                  | 548.20        |
      | MDCS2S   | 2013-04-01 | 1                         | No           | 20                    | 2.00                  | 316.00        |
      | MDCS2S   | 2013-04-01 | 2                         | Yes          | 20                    | 2.00                  | 727.60        |
      | MDCS1S   | 2013-04-01 | 1                         | No           | 20                    | 2.00                  | 253.00        |
      | MDCS1S   | 2013-04-01 | 3                         | Yes          | 20                    | 2.00                  | 475.60        |
      | MDCC2S   | 2013-04-01 | 1                         | No           | 20                    | 2.00                  | 378.00        |
      | MDCC2S   | 2013-04-01 | 2                         | Yes          | 20                    | 2.00                  | 949.60        |
      | MDCC1S   | 2013-04-01 | 1                         | No           | 20                    | 2.00                  | 315.00        |
      | MDCC1S   | 2013-04-01 | 4                         | Yes          | 20                    | 2.00                  | 623.80        |


    @mental_health_sg
    Examples: Mental Health SG reworked to include all codes
      | feeCode | startDate  | netProfitCosts | netCostOfCounsel | boltOnAdjournedHearing | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal |
      | MHL01   | 2013-04-01 | 100.00         |                  |                        | Yes          | 20                    | 2.00                  | 325.60        |
      | MHL02   | 2013-04-01 |                |                  | 1                      | No           | 20                    | 2.00                  | 268.00        |
      | MHL03   | 2013-04-01 |                |                  | 2                      | Yes          | 20                    | 2.00                  | 842.80        |
      | MHL04   | 2013-04-01 |                | 100.00           | 9                      | No           | 20                    | 2.00                  | 1819.00       |
      | MHL05   | 2013-04-01 |                |                  | 4                      | Yes          | 5                     | 2.00                  | 952.80        |
      | MHL06   | 2013-04-01 |                |                  | 5                      | No           | 20                    | 2.00                  | 1222.00       |
      | MHL07   | 2013-04-01 | 100.00         |                  | 3                      | Yes          | 20                    | 2.00                  | 796.00        |
      | MHL08   | 2013-04-01 |                |                  | 4                      | No           | 20                    | 2.00                  | 913.00        |
      | MHL10   | 2013-04-01 |                |                  |                        | Yes          | 20                    | 2.00                  | 176.80        |

    @discrimination_sg
    Examples: Discrimination sg
      | feeCode | startDate  | netProfitCosts | netCostOfCounsel | travelAndWaitingCosts | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal |
      | DISC    | 2013-04-01 | 400            | 300              | 100                   | Yes          | 20                    | 2.00                  | 862.00        |
      | DISC    | 2013-04-01 | 300            | 399              |                       | No           | 20                    | 2.00                  | 721.00        |
      | DISC    | 2013-04-01 |                | 700              |                       | Yes          | 20                    | 2.00                  | 862.00        |
      | DISC    | 2013-04-01 | 700            |                  |                       | No           | 20                    | 2.00                  | 722.00        |

    @police_station_work
    Examples: Police Station Work
      | feeCode  | startDate  | uniqueFileNumber  | policeStationId | policeStationSchemeId  | netDisbursementAmount | disbursementVatAmount | vatIndicator | numberOfMediationSessions | boltOnAdjournedHearing | expectedTotal | representationOrderDate |
      | INVC     | 2016-04-01 | 110516/001        | NE001           | 1001                   | 20                    | 10.50                 | true         | 0                         | 0                      | 181.68| 2016-04-02              |
      | INVC     | 2016-04-01 | 110516/002        | NE003           | 1001                   | 20                    | 10.50                 | false        | 0                         | 0                      | 159.96|                         |
      | INVC     | 2022-09-30 | 121022/003        | NE016           | 1004                   | 20                    | 15.50                 | true         | 0                         | 0                      | 234.30|                         |
      | INVC     | 2022-09-30 | 121022/004        | NE041           | 1010                   | 20                    | 15.50                 | false        | 0                         | 0                      | 185.61|                         |
      | INVC     | 2024-12-06 | 131224/005        | RD052           | 1141                   | 20                    | 15.50                 | true         | 0                         | 0                      | 314.44|                         |
      | INVC     | 2024-12-06 | 131224/006        | RD091           | 1142                   | 20                    | 15.50                 | false        | 0                         | 0                      | 247.52|                         |

    @police_station_work_all_INVC
    Examples: Police station work all INVC codes 01-04-16
      | feeCode | startDate   | uniqueFileNumber | policeStationId | policeStationSchemeId | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal |
      | INVC    | 2022-09-29  | 290922/001       | NE001           | 1001                  | Yes          | 20                    | 10.5                  | 181.68|
      | INVC    | 2022-09-29  | 290922/001       | NE005           | 1002                  | No           | 20                    | 10.5                  | 159.96|
      | INVC    | 2022-09-29  | 290922/001       | NE010           | 1003                  | Yes          | 20                    | 10.5                  | 209.45|
      | INVC    | 2022-09-29  | 290922/001       | NE016           | 1004                  | No           | 20                    | 10.5                  | 176.39|
      | INVC    | 2022-09-29  | 290922/001       | NE019           | 1005                  | Yes          | 20                    | 10.5                  | 237.53|
      | INVC    | 2022-09-29  | 290922/001       | NE021           | 1006                  | No           | 20                    | 10.5                  | 195.63|
      | INVC    | 2022-09-29  | 290922/001       | NE906           | 1007                  | Yes          | 20                    | 10.5                  | 224.39|
      | INVC    | 2022-09-29  | 290922/001       | NE027           | 1008                  | No           | 20                    | 10.5                  | 172.33|
      | INVC    | 2022-09-29  | 290922/001       | NE032           | 1009                  | Yes          | 20                    | 10.5                  | 189.35|
      | INVC    | 2022-09-29  | 290922/001       | NE040           | 1010                  | No           | 20                    | 10.5                  | 166.90|
      | INVC    | 2022-09-29  | 290922/001       | NE044           | 1011                  | Yes          | 20                    | 10.5                  | 192.64|
      | INVC    | 2022-09-29  | 290922/001       | NE045           | 1012                  | No           | 20                    | 10.5                  | 157.23|
      | INVC    | 2022-09-29  | 290922/001       | NE051           | 1013                  | Yes          | 20                    | 10.5                  | 202.49|
      | INVC    | 2022-09-29  | 290922/001       | NE053           | 1014                  | No           | 20                    | 10.5                  | 201.03|
      | INVC    | 2022-09-29  | 290922/001       | NE057           | 1015                  | Yes          | 20                    | 10.5                  | 209.05|
      | INVC    | 2022-09-29  | 290922/001       | RD002           | 1131                  | No           | 20                    | 10.5                  | 232.96|
      | INVC    | 2022-09-29  | 290922/001       | RD006           | 1132                  | Yes          | 20                    | 10.5                  | 262.57|
      | INVC    | 2022-09-29  | 290922/001       | RD014           | 1133                  | No           | 20                    | 10.5                  | 214.71|
      | INVC    | 2022-09-29  | 290922/001       | RD017           | 1134                  | Yes          | 20                    | 10.5                  | 222.19|
      | INVC    | 2022-09-29  | 290922/001       | RD904           | 1135                  | No           | 20                    | 10.5                  | 218.36|
      | INVC    | 2022-09-29  | 290922/001       | RD026           | 1136                  | Yes          | 20                    | 10.5                  | 257.23|
      | INVC    | 2022-09-29  | 290922/001       | RD039           | 1137                  | No           | 20                    | 10.5                  | 212.71|
      | INVC    | 2022-09-29  | 290922/001       | RD030           | 1138                  | Yes          | 20                    | 10.5                  | 274.75|
      | INVC    | 2022-09-29  | 290922/001       | RD061           | 1139                  | No           | 20                    | 10.5                  | 198.73|
      | INVC    | 2022-09-29  | 290922/001       | RD050           | 1140                  | Yes          | 20                    | 10.5                  | 263.81|
      | INVC    | 2022-09-29  | 290922/001       | RD054           | 1141                  | No           | 20                    | 10.5                  | 234.46|
      | INVC    | 2022-09-29  | 290922/001       | RD068           | 1142                  | Yes          | 20                    | 10.5                  | 229.96|
      | INVC    | 2022-09-29  | 290922/001       | RD087           | 1143                  | No           | 20                    | 10.5                  | 200.29|
      | INVC    | 2022-09-29  | 290922/001       | RD913           | 1144                  | Yes          | 20                    | 10.5                  | 282.13|
      | INVC    | 2022-09-29  | 290922/001       | RD080           | 1145                  | No           | 20                    | 10.5                  | 222.81|
      | INVC    | 2022-09-29  | 290922/001       | LS003           | 1201                  | Yes          | 20                    | 10.5                  | 185.22|
      | INVC    | 2022-09-29  | 290922/001       | LS005           | 1202                  | No           | 20                    | 10.5                  | 168.18|
      | INVC    | 2022-09-29  | 290922/001       | LS015           | 1203                  | Yes          | 20                    | 10.5                  | 207.96|
      | INVC    | 2022-09-29  | 290922/001       | LS020           | 1204                  | No           | 20                    | 10.5                  | 201.94|
      | INVC    | 2022-09-29  | 290922/001       | LS024           | 1205                  | Yes          | 20                    | 10.5                  | 243.00|
      | INVC    | 2022-09-29  | 290922/001       | LS025           | 1206                  | No           | 20                    | 10.5                  | 215.82|
      | INVC    | 2022-09-29  | 290922/001       | LS033           | 1207                  | Yes          | 20                    | 10.5                  | 244.86|
      | INVC    | 2022-09-29  | 290922/001       | LS907           | 1208                  | No           | 20                    | 10.5                  | 201.94|
      | INVC    | 2022-09-29  | 290922/001       | LS042           | 1209                  | Yes          | 20                    | 10.5                  | 206.87|
      | INVC    | 2022-09-29  | 290922/001       | LS044           | 1210                  | No           | 20                    | 10.5                  | 170.78|
      | INVC    | 2022-09-29  | 290922/001       | LS046           | 1211                  | Yes          | 20                    | 10.5                  | 215.63|
      | INVC    | 2022-09-29  | 290922/001       | LS050           | 1212                  | No           | 20                    | 10.5                  | 182.78|
      | INVC    | 2022-09-29  | 290922/001       | LS057           | 1213                  | Yes          | 20                    | 10.5                  | 207.96|
      | INVC    | 2022-09-29  | 290922/001       | LS073           | 1214                  | No           | 20                    | 10.5                  | 186.43|
      | INVC    | 2022-09-29  | 290922/001       | LS082           | 1215                  | Yes          | 20                    | 10.5                  | 224.39|
      | INVC    | 2022-09-29  | 290922/001       | LS084           | 1216                  | No           | 20                    | 10.5                  | 197.96|
      | INVC    | 2022-09-29  | 290922/001       | LS089           | 1217                  | Yes          | 20                    | 10.5                  | 200.14|
      | INVC    | 2022-09-29  | 290922/001       | LS093           | 1218                  | No           | 20                    | 10.5                  | 183.20|
      | INVC    | 2022-09-29  | 290922/001       | LS094           | 1219                  | Yes          | 20                    | 10.5                  | 187.15|
      | INVC    | 2022-09-29  | 290922/001       | LS106           | 1220                  | No           | 20                    | 10.5                  | 177.30|
      | INVC    | 2022-09-29  | 290922/001       | LS109           | 1221                  | Yes          | 20                    | 10.5                  | 197.02|
      | INVC    | 2022-09-29  | 290922/001       | LS122           | 1222                  | No           | 20                    | 10.5                  | 165.34|
      | INVC    | 2022-09-29  | 290922/001       | LS128           | 1223                  | Yes          | 20                    | 10.5                  | 191.53|
      | INVC    | 2022-09-29  | 290922/001       | LN002           | 1301                  | No           | 20                    | 10.5                  | 248.48|
      | INVC    | 2022-09-29  | 290922/001       | LN006           | 1302                  | Yes          | 20                    | 10.5                  | 264.90|
      | INVC    | 2022-09-29  | 290922/001       | LN010           | 1303                  | No           | 20                    | 10.5                  | 258.51|
      | INVC    | 2022-09-29  | 290922/001       | LN016           | 1304                  | Yes          | 20                    | 10.5                  | 286.80|
      | INVC    | 2022-09-29  | 290922/001       | LN022           | 1305                  | No           | 20                    | 10.5                  | 246.65|
      | INVC    | 2022-09-29  | 290922/001       | LN027           | 1306                  | Yes          | 20                    | 10.5                  | 278.04|
      | INVC    | 2022-09-29  | 290922/001       | LN034           | 1307                  | No           | 20                    | 10.5                  | 243.00|
      | INVC    | 2022-09-29  | 290922/001       | LN907           | 1308                  | Yes          | 20                    | 10.5                  | 308.70|
      | INVC    | 2022-09-29  | 290922/001       | LN071           | 1309                  | No           | 20                    | 10.5                  | 245.74|
      | INVC    | 2022-09-29  | 290922/001       | LN083           | 1310                  | Yes          | 20                    | 10.5                  | 283.51|
      | INVC    | 2022-09-29  | 290922/001       | LN088           | 1311                  | No           | 20                    | 10.5                  | 253.95|
      | INVC    | 2022-09-29  | 290922/001       | LN091           | 1312                  | Yes          | 20                    | 10.5                  | 285.71|
      | INVC    | 2022-09-29  | 290922/001       | LN912           | 1313                  | No           | 20                    | 10.5                  | 232.96|
      | INVC    | 2022-09-29  | 290922/001       | LN110           | 1314                  | Yes          | 20                    | 10.5                  | 294.47|
      | INVC    | 2022-09-29  | 290922/001       | LN114           | 1315                  | No           | 20                    | 10.5                  | 243.00|
      | INVC    | 2022-09-29  | 290922/001       | LN120           | 1316                  | Yes          | 20                    | 10.5                  | 269.28|
      | INVC    | 2022-09-29  | 290922/001       | LN204           | 1317                  | No           | 20                    | 10.5                  | 298.66|
      | INVC    | 2022-09-29  | 290922/001       | LN125           | 1318                  | Yes          | 20                    | 10.5                  | 289.00|
      | INVC    | 2022-09-29  | 290922/001       | LN917           | 1319                  | No           | 20                    | 10.5                  | 253.95|
      | INVC    | 2022-09-29  | 290922/001       | LN141           | 1320                  | Yes          | 20                    | 10.5                  | 297.76|
      | INVC    | 2022-09-29  | 290922/001       | LN145           | 1321                  | No           | 20                    | 10.5                  | 243.91|
      | INVC    | 2022-09-29  | 290922/001       | LN151           | 1322                  | Yes          | 20                    | 10.5                  | 286.80|
      | INVC    | 2022-09-29  | 290922/001       | LN153           | 1323                  | No           | 20                    | 10.5                  | 249.39|
      | INVC    | 2022-09-29  | 290922/001       | LN922           | 1324                  | Yes          | 20                    | 10.5                  | 313.08|
      | INVC    | 2022-09-29  | 290922/001       | LN167           | 1325                  | No           | 20                    | 10.5                  | 253.95|
      | INVC    | 2022-09-29  | 290922/001       | LN170           | 1326                  | Yes          | 20                    | 10.5                  | 285.71|
      | INVC    | 2022-09-29  | 290922/001       | LN177           | 1327                  | No           | 20                    | 10.5                  | 242.09|
      | INVC    | 2022-09-29  | 290922/001       | LN181           | 1328                  | Yes          | 20                    | 10.5                  | 303.23|
      | INVC    | 2022-09-29  | 290922/001       | LN927           | 1329                  | No           | 20                    | 10.5                  | 234.79|
      | INVC    | 2022-09-29  | 290922/001       | LN197           | 1330                  | Yes          | 20                    | 10.5                  | 269.28|
      | INVC    | 2022-09-29  | 290922/001       | LN200           | 1331                  | No           | 20                    | 10.5                  | 259.43|
      | INVC    | 2022-09-29  | 290922/001       | LN203           | 1332                  | Yes          | 20                    | 10.5                  | 292.27|
      | INVC    | 2022-09-29  | 290922/001       | BR001           | 2001                  | No           | 20                    | 10.5                  | 201.94|
      | INVC    | 2022-09-29  | 290922/001       | BR902           | 2002                  | Yes          | 20                    | 10.5                  | 256.04|
      | INVC    | 2022-09-29  | 290922/001       | BR013           | 2003                  | No           | 20                    | 10.5                  | 240.67|
      | INVC    | 2022-09-29  | 290922/001       | BR022           | 2004                  | Yes          | 20                    | 10.5                  | 215.98|
      | INVC    | 2022-09-29  | 290922/001       | BR904           | 2005                  | No           | 20                    | 10.5                  | 205.59|
      | INVC    | 2022-09-29  | 290922/001       | BR042           | 2006                  | Yes          | 20                    | 10.5                  | 241.14|
      | INVC    | 2022-09-29  | 290922/001       | BR906           | 2007                  | No           | 20                    | 10.5                  | 206.50|
      | INVC    | 2022-09-29  | 290922/001       | BR055           | 2008                  | Yes          | 20                    | 10.5                  | 198.26|
      | INVC    | 2022-09-29  | 290922/001       | BR058           | 2009                  | No           | 20                    | 10.5                  | 177.30|
      | INVC    | 2022-09-29  | 290922/001       | BR909           | 2010                  | Yes          | 20                    | 10.5                  | 199.20|
      | INVC    | 2022-09-29  | 290922/001       | BR068           | 2011                  | No           | 20                    | 10.5                  | 198.29|
      | INVC    | 2022-09-29  | 290922/001       | BR079           | 2012                  | Yes          | 20                    | 10.5                  | 249.53|
      | INVC    | 2022-09-29  | 290922/001       | BR089           | 2013                  | No           | 20                    | 10.5                  | 195.55|
      | INVC    | 2022-09-29  | 290922/001       | BR099           | 2014                  | Yes          | 20                    | 10.5                  | 213.43|
      | INVC    | 2022-09-29  | 290922/001       | BR101           | 2015                  | No           | 20                    | 10.5                  | 179.13|
      | INVC    | 2022-09-29  | 290922/001       | BR106           | 2016                  | Yes          | 20                    | 10.5                  | 237.53|
      | INVC    | 2022-09-29  | 290922/001       | BR108           | 2017                  | No           | 20                    | 10.5                  | 197.96|
      | INVC    | 2022-09-29  | 290922/001       | BR917           | 2018                  | Yes          | 20                    | 10.5                  | 209.45|
      | INVC    | 2022-09-29  | 290922/001       | BR133           | 2019                  | No           | 20                    | 10.5                  | 203.40|
      | INVC    | 2022-09-29  | 290922/001       | BR148           | 2020                  | Yes          | 20                    | 10.5                  | 262.72|
      | INVC    | 2022-09-29  | 290922/001       | BR920           | 2021                  | No           | 20                    | 10.5                  | 201.94|
      | INVC    | 2022-09-29  | 290922/001       | BR180           | 2022                  | Yes          | 20                    | 10.5                  | 219.80|
      | INVC    | 2022-09-29  | 290922/001       | BM001           | 3001                  | No           | 20                    | 10.5                  | 201.94|
      | INVC    | 2022-09-29  | 290922/001       | BM282           | 3002                  | Yes          | 20                    | 10.5                  | 237.53|
      | INVC    | 2022-09-29  | 290922/001       | BM032           | 3003                  | No           | 20                    | 10.5                  | 196.46|
      | INVC    | 2022-09-29  | 290922/001       | BM039           | 3004                  | Yes          | 20                    | 10.5                  | 238.33|
      | INVC    | 2022-09-29  | 290922/001       | BM904           | 3005                  | No           | 20                    | 10.5                  | 179.32|
      | INVC    | 2022-09-29  | 290922/001       | BM088           | 3006                  | Yes          | 20                    | 10.5                  | 262.57|
      | INVC    | 2022-09-29  | 290922/001       | BM906           | 3007                  | No           | 20                    | 10.5                  | 190.08|
      | INVC    | 2022-09-29  | 290922/001       | BM286           | 3008                  | Yes          | 20                    | 10.5                  | 230.95|
      | INVC    | 2022-09-29  | 290922/001       | BM125           | 3009                  | No           | 20                    | 10.5                  | 204.95|
      | INVC    | 2022-09-29  | 290922/001       | BM909           | 3010                  | Yes          | 20                    | 10.5                  | 235.33|
      | INVC    | 2022-09-29  | 290922/001       | BM291           | 3011                  | No           | 20                    | 10.5                  | 200.11|
      | INVC    | 2022-09-29  | 290922/001       | BM225           | 3012                  | Yes          | 20                    | 10.5                  | 231.82|
      | INVC    | 2022-09-29  | 290922/001       | BM154           | 3013                  | No           | 20                    | 10.5                  | 201.94|
      | INVC    | 2022-09-29  | 290922/001       | BM220           | 3014                  | Yes          | 20                    | 10.5                  | 237.53|
      | INVC    | 2022-09-29  | 290922/001       | BM203           | 3015                  | No           | 20                    | 10.5                  | 211.16|
      | INVC    | 2022-09-29  | 290922/001       | BM207           | 3016                  | Yes          | 20                    | 10.5                  | 208.52|
      | INVC    | 2022-09-29  | 290922/001       | WA001           | 4001                  | No           | 20                    | 10.5                  | 201.94|
      | INVC    | 2022-09-29  | 290922/001       | WA003           | 4002                  | Yes          | 20                    | 10.5                  | 266.30|
      | INVC    | 2022-09-29  | 290922/001       | WA008           | 4003                  | No           | 20                    | 10.5                  | 162.70|
      | INVC    | 2022-09-29  | 290922/001       | WA010           | 4004                  | Yes          | 20                    | 10.5                  | 268.16|
      | INVC    | 2022-09-29  | 290922/001       | WA904           | 4005                  | No           | 20                    | 10.5                  | 179.32|
      | INVC    | 2022-09-29  | 290922/001       | WA020           | 4006                  | Yes          | 20                    | 10.5                  | 269.09|
      | INVC    | 2022-09-29  | 290922/001       | WA026           | 4007                  | No           | 20                    | 10.5                  | 190.99|
      | INVC    | 2022-09-29  | 290922/001       | WA907           | 4008                  | Yes          | 20                    | 10.5                  | 227.68|
      | INVC    | 2022-09-29  | 290922/001       | WA908           | 4009                  | No           | 20                    | 10.5                  | 190.99|
      | INVC    | 2022-09-29  | 290922/001       | WA039           | 4010                  | Yes          | 20                    | 10.5                  | 237.53|
      | INVC    | 2022-09-29  | 290922/001       | WA050           | 4011                  | No           | 20                    | 10.5                  | 213.49|
      | INVC    | 2022-09-29  | 290922/001       | WA052           | 4012                  | Yes          | 20                    | 10.5                  | 232.06|
      | INVC    | 2022-09-29  | 290922/001       | WA060           | 4013                  | No           | 20                    | 10.5                  | 212.71|
      | INVC    | 2022-09-29  | 290922/001       | WA062           | 4014                  | Yes          | 20                    | 10.5                  | 250.45|
      | INVC    | 2022-09-29  | 290922/001       | WA067           | 4015                  | No           | 20                    | 10.5                  | 201.94|
      | INVC    | 2022-09-29  | 290922/001       | WA073           | 4016                  | Yes          | 20                    | 10.5                  | 260.71|
      | INVC    | 2022-09-29  | 290922/001       | WA916           | 4017                  | No           | 20                    | 10.5                  | 157.57|
      | INVC    | 2022-09-29  | 290922/001       | WA078           | 4018                  | Yes          | 20                    | 10.5                  | 217.84|
      | INVC    | 2022-09-29  | 290922/001       | WA918           | 4019                  | No           | 20                    | 10.5                  | 201.94|
      | INVC    | 2022-09-29  | 290922/001       | WA099           | 4020                  | Yes          | 20                    | 10.5                  | 273.76|
      | INVC    | 2022-09-29  | 290922/001       | WA103           | 4021                  | No           | 20                    | 10.5                  | 201.94|
      | INVC    | 2022-09-29  | 290922/001       | WA108           | 4022                  | Yes          | 20                    | 10.5                  | 237.53|
      | INVC    | 2022-09-29  | 290922/001       | WA922           | 4023                  | No           | 20                    | 10.5                  | 201.94|
      | INVC    | 2022-09-29  | 290922/001       | WA119           | 4024                  | Yes          | 20                    | 10.5                  | 286.80|
      | INVC    | 2022-09-29  | 290922/001       | WA123           | 4025                  | No           | 20                    | 10.5                  | 201.94|
      | INVC    | 2022-09-29  | 290922/001       | WA127           | 4026                  | Yes          | 20                    | 10.5                  | 240.82|
      | INVC    | 2022-09-29  | 290922/001       | WA131           | 4027                  | No           | 20                    | 10.5                  | 195.55|
      | INVC    | 2022-09-29  | 290922/001       | LV900           | 5001                  | Yes          | 20                    | 10.5                  | 218.92|
      | INVC    | 2022-09-29  | 290922/001       | LV029           | 5002                  | No           | 20                    | 10.5                  | 159.91|
      | INVC    | 2022-09-29  | 290922/001       | LV018           | 5003                  | Yes          | 20                    | 10.5                  | 239.28|
      | INVC    | 2022-09-29  | 290922/001       | LV030           | 5004                  | No           | 20                    | 10.5                  | 177.30|
      | INVC    | 2022-09-29  | 290922/001       | LV901           | 5005                  | Yes          | 20                    | 10.5                  | 222.19|
      | INVC    | 2022-09-29  | 290922/001       | LV036           | 5006                  | No           | 20                    | 10.5                  | 181.86|
      | INVC    | 2022-09-29  | 290922/001       | MA001           | 6001                  | Yes          | 20                    | 10.5                  | 235.33|
      | INVC    | 2022-09-29  | 290922/001       | MA019           | 6002                  | No           | 20                    | 10.5                  | 178.54|
      | INVC    | 2022-09-29  | 290922/001       | MA022           | 6003                  | Yes          | 20                    | 10.5                  | 216.91|
      | INVC    | 2022-09-29  | 290922/001       | MA035           | 6004                  | No           | 20                    | 10.5                  | 177.77|
      | INVC    | 2022-09-29  | 290922/001       | MA044           | 6005                  | Yes          | 20                    | 10.5                  | 243.94|
      | INVC    | 2022-09-29  | 290922/001       | MA056           | 6006                  | No           | 20                    | 10.5                  | 197.18|
      | INVC    | 2022-09-29  | 290922/001       | MA100           | 6007                  | Yes          | 20                    | 10.5                  | 196.40|
      | INVC    | 2022-09-29  | 290922/001       | MA113           | 6008                  | No           | 20                    | 10.5                  | 201.94|
      | INVC    | 2022-09-29  | 290922/001       | MA123           | 6009                  | Yes          | 20                    | 10.5                  | 225.29|
      | INVC    | 2022-09-29  | 290922/001       | MA129           | 6010                  | No           | 20                    | 10.5                  | 201.94|
      | INVC    | 2022-09-29  | 290922/001       | MA136           | 6011                  | Yes          | 20                    | 10.5                  | 237.53|
      | INVC    | 2022-09-29  | 290922/001       | MA911           | 6012                  | No           | 20                    | 10.5                  | 188.64|
      | INVC    | 2022-09-29  | 290922/001       | MA152           | 6013                  | Yes          | 20                    | 10.5                  | 215.98|
      | INVC    | 2022-09-29  | 290922/001       | MA158           | 6014                  | No           | 20                    | 10.5                  | 194.07|
      | INVC    | 2022-09-29  | 290922/001       | MA166           | 6015                  | Yes          | 20                    | 10.5                  | 227.16|
      | INVC    | 2022-09-29  | 290922/001       | MA175           | 6016                  | No           | 20                    | 10.5                  | 180.04|
      | INVC    | 2022-09-29  | 290922/001       | MA179           | 6017                  | Yes          | 20                    | 10.5                  | 188.95|
      | INVC    | 2022-09-29  | 290922/001       | MA187           | 6018                  | No           | 20                    | 10.5                  | 186.31|
      | INVC    | 2022-09-29  | 290922/001       | MA918           | 6019                  | Yes          | 20                    | 10.5                  | 237.53|
      | INVC    | 2022-09-29  | 290922/001       | MA199           | 6020                  | No           | 20                    | 10.5                  | 150.58|
      | INVC    | 2022-09-29  | 290922/001       | MA208           | 6021                  | Yes          | 20                    | 10.5                  | 179.63|
      | INVC    | 2022-09-29  | 290922/001       | MA210           | 6022                  | No           | 20                    | 10.5                  | 183.20|
      | INVC    | 2022-09-29  | 290922/001       | MA213           | 6023                  | Yes          | 20                    | 10.5                  | 233.68|
      | INVC    | 2022-09-29  | 290922/001       | MA923           | 6024                  | No           | 20                    | 10.5                  | 166.90|
      | INVC    | 2022-09-29  | 290922/001       | BG020           | 7001                  | Yes          | 20                    | 10.5                  | 303.58|
      | INVC    | 2022-09-29  | 290922/001       | BG001           | 7002                  | No           | 20                    | 10.5                  | 229.31|
      | INVC    | 2022-09-29  | 290922/001       | BG027           | 7003                  | Yes          | 20                    | 10.5                  | 270.02|
      | INVC    | 2022-09-29  | 290922/001       | BG035           | 7004                  | No           | 20                    | 10.5                  | 267.07|
      | INVC    | 2022-09-29  | 290922/001       | BG024           | 7005                  | Yes          | 20                    | 10.5                  | 284.00|
      | INVC    | 2022-09-29  | 290922/001       | BG014           | 7006                  | No           | 20                    | 10.5                  | 201.94|
      | INVC    | 2022-09-29  | 290922/001       | BG037           | 7007                  | Yes          | 20                    | 10.5                  | 273.76|
      | INVC    | 2022-09-29  | 290922/001       | BG045           | 7008                  | No           | 20                    | 10.5                  | 203.76|
      | INVC    | 2022-09-29  | 290922/001       | BG052           | 7009                  | Yes          | 20                    | 10.5                  | 259.43|
      | INVC    | 2022-09-29  | 290922/001       | BG058           | 7010                  | No           | 20                    | 10.5                  | 231.14|
      | INVC    | 2022-09-29  | 290922/001       | BG043           | 7011                  | Yes          | 20                    | 10.5                  | 275.86|
      | INVC    | 2022-09-29  | 290922/001       | BG060           | 7012                  | No           | 20                    | 10.5                  | 264.90|
      | INVC    | 2022-09-29  | 290922/001       | BG066           | 7013                  | Yes          | 20                    | 10.5                  | 244.09|
      | INVC    | 2022-09-29  | 290922/001       | BG070           | 7014                  | No           | 20                    | 10.5                  | 186.43|
      | INVC    | 2022-09-29  | 290922/001       | BG081           | 7015                  | Yes          | 20                    | 10.5                  | 297.98|
      | INVC    | 2022-09-29  | 290922/001       | BG087           | 7016                  | No           | 20                    | 10.5                  | 166.35|
      | INVC    | 2022-09-29  | 290922/001       | BG092           | 7017                  | Yes          | 20                    | 10.5                  | 221.10|
      | INVC    | 2022-09-29  | 290922/001       | BG083           | 7018                  | No           | 20                    | 10.5                  | 197.18|
      | INVC    | 2022-09-29  | 290922/001       | NT002           | 8001                  | Yes          | 20                    | 10.5                  | 271.88|
      | INVC    | 2022-09-29  | 290922/001       | NT015           | 8002                  | No           | 20                    | 10.5                  | 214.27|
      | INVC    | 2022-09-29  | 290922/001       | NT021           | 8003                  | Yes          | 20                    | 10.5                  | 237.41|
      | INVC    | 2022-09-29  | 290922/001       | NT023           | 8004                  | No           | 20                    | 10.5                  | 201.94|
      | INVC    | 2022-09-29  | 290922/001       | NT033           | 8005                  | Yes          | 20                    | 10.5                  | 242.06|
      | INVC    | 2022-09-29  | 290922/001       | NT905           | 8006                  | No           | 20                    | 10.5                  | 201.94|
      | INVC    | 2022-09-29  | 290922/001       | NT052           | 8007                  | Yes          | 20                    | 10.5                  | 266.30|
      | INVC    | 2022-09-29  | 290922/001       | NT060           | 8008                  | No           | 20                    | 10.5                  | 197.38|
      | INVC    | 2022-09-29  | 290922/001       | NT067           | 8009                  | Yes          | 20                    | 10.5                  | 211.31|
      | INVC    | 2022-09-29  | 290922/001       | NT122           | 8010                  | No           | 20                    | 10.5                  | 185.53|
      | INVC    | 2022-09-29  | 290922/001       | NT082           | 8011                  | Yes          | 20                    | 10.5                  | 215.63|
      | INVC    | 2022-09-29  | 290922/001       | NT085           | 8012                  | No           | 20                    | 10.5                  | 184.60|
      | INVC    | 2022-09-29  | 290922/001       | NT087           | 8013                  | Yes          | 20                    | 10.5                  | 240.20|
      | INVC    | 2022-09-29  | 290922/001       | NT089           | 8014                  | No           | 20                    | 10.5                  | 203.40|
      | INVC    | 2022-09-29  | 290922/001       | NT111           | 8015                  | Yes          | 20                    | 10.5                  | 228.77|
      | INVC    | 2022-09-29  | 290922/001       | NT115           | 8016                  | No           | 20                    | 10.5                  | 181.65|
      | INVC    | 2022-09-29  | 290922/001       | NT118           | 8017                  | Yes          | 20                    | 10.5                  | 229.02|
      | INVC    | 2022-09-29  | 290922/001       | EA144           | 9001                  | No           | 20                    | 10.5                  | 191.90|
      | INVC    | 2022-09-29  | 290922/001       | EA004           | 9002                  | Yes          | 20                    | 10.5                  | 237.53|
      | INVC    | 2022-09-29  | 290922/001       | EA011           | 9003                  | No           | 20                    | 10.5                  | 186.43|
      | INVC    | 2022-09-29  | 290922/001       | EA012           | 9004                  | Yes          | 20                    | 10.5                  | 237.53|
      | INVC    | 2022-09-29  | 290922/001       | EA014           | 9005                  | No           | 20                    | 10.5                  | 197.18|
      | INVC    | 2022-09-29  | 290922/001       | EA145           | 9006                  | Yes          | 20                    | 10.5                  | 229.96|
      | INVC    | 2022-09-29  | 290922/001       | EA022           | 9007                  | No           | 20                    | 10.5                  | 166.90|
      | INVC    | 2022-09-29  | 290922/001       | EA907           | 9008                  | Yes          | 20                    | 10.5                  | 237.53|
      | INVC    | 2022-09-29  | 290922/001       | EA028           | 9009                  | No           | 20                    | 10.5                  | 273.11|
      | INVC    | 2022-09-29  | 290922/001       | EA032           | 9010                  | Yes          | 20                    | 10.5                  | 262.72|
      | INVC    | 2022-09-29  | 290922/001       | EA037           | 9011                  | No           | 20                    | 10.5                  | 201.94|
      | INVC    | 2022-09-29  | 290922/001       | EA045           | 9012                  | Yes          | 20                    | 10.5                  | 303.23|
      | INVC    | 2022-09-29  | 290922/001       | EA049           | 9013                  | No           | 20                    | 10.5                  | 256.69|
      | INVC    | 2022-09-29  | 290922/001       | EA054           | 9014                  | Yes          | 20                    | 10.5                  | 332.80|
      | INVC    | 2022-09-29  | 290922/001       | EA055           | 9015                  | No           | 20                    | 10.5                  | 190.97|
      | INVC    | 2022-09-29  | 290922/001       | EA062           | 9016                  | Yes          | 20                    | 10.5                  | 235.33|
      | INVC    | 2022-09-29  | 290922/001       | EA149           | 9017                  | No           | 20                    | 10.5                  | 233.88|
      | INVC    | 2022-09-29  | 290922/001       | EA069           | 9018                  | Yes          | 20                    | 10.5                  | 329.51|
      | INVC    | 2022-09-29  | 290922/001       | EA150           | 9019                  | No           | 20                    | 10.5                  | 260.34|
      | INVC    | 2022-09-29  | 290922/001       | EA081           | 9020                  | Yes          | 20                    | 10.5                  | 281.33|
      | INVC    | 2022-09-29  | 290922/001       | EA083           | 9021                  | No           | 20                    | 10.5                  | 234.79|
      | INVC    | 2022-09-29  | 290922/001       | EA091           | 9022                  | Yes          | 20                    | 10.5                  | 245.20|
      | INVC    | 2022-09-29  | 290922/001       | EA096           | 9023                  | No           | 20                    | 10.5                  | 192.52|
      | INVC    | 2022-09-29  | 290922/001       | EA099           | 9024                  | Yes          | 20                    | 10.5                  | 221.57|
      | INVC    | 2022-09-29  | 290922/001       | EA107           | 9025                  | No           | 20                    | 10.5                  | 193.30|
      | INVC    | 2022-09-29  | 290922/001       | EA132           | 9026                  | Yes          | 20                    | 10.5                  | 234.24|
      | INVC    | 2022-09-29  | 290922/001       | EA115           | 9027                  | No           | 20                    | 10.5                  | 222.01|
      | INVC    | 2022-09-29  | 290922/001       | EA118           | 9028                  | Yes          | 20                    | 10.5                  | 227.16|
      | INVC    | 2022-09-29  | 290922/001       | EA127           | 9029                  | No           | 20                    | 10.5                  | 196.41|
      | INVC    | 2022-09-29  | 290922/001       | EA131           | 9030                  | Yes          | 20                    | 10.5                  | 237.53|

    @police_station_work_all_INVC_2
    Examples: Police station work all INVC codes 30-09-22
      | feeCode | startDate   | uniqueFileNumber | policeStationId | policeStationSchemeId | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal |
      | INVC    | 2022-09-30  | 300922/001       | NE001           | 1001                  | Yes          | 20                    | 10.5                  | 205.33|
      | INVC    | 2022-09-30  | 300922/001       | NE005           | 1002                  | No           | 20                    | 10.5                  | 180.35|
      | INVC    | 2022-09-30  | 300922/001       | NE010           | 1003                  | Yes          | 20                    | 10.5                  | 237.26|
      | INVC    | 2022-09-30  | 300922/001       | NE016           | 1004                  | No           | 20                    | 10.5                  | 199.25|
      | INVC    | 2022-09-30  | 300922/001       | NE019           | 1005                  | Yes          | 20                    | 10.5                  | 269.56|
      | INVC    | 2022-09-30  | 300922/001       | NE021           | 1006                  | No           | 20                    | 10.5                  | 221.37|
      | INVC    | 2022-09-30  | 300922/001       | NE906           | 1007                  | Yes          | 20                    | 10.5                  | 254.45|
      | INVC    | 2022-09-30  | 300922/001       | NE027           | 1008                  | No           | 20                    | 10.5                  | 194.58|
      | INVC    | 2022-09-30  | 300922/001       | NE032           | 1009                  | Yes          | 20                    | 10.5                  | 214.15|
      | INVC    | 2022-09-30  | 300922/001       | NE040           | 1010                  | No           | 20                    | 10.5                  | 188.34|
      | INVC    | 2022-09-30  | 300922/001       | NE044           | 1011                  | Yes          | 20                    | 10.5                  | 217.93|
      | INVC    | 2022-09-30  | 300922/001       | NE045           | 1012                  | No           | 20                    | 10.5                  | 177.21|
      | INVC    | 2022-09-30  | 300922/001       | NE051           | 1013                  | Yes          | 20                    | 10.5                  | 229.26|
      | INVC    | 2022-09-30  | 300922/001       | NE053           | 1014                  | No           | 20                    | 10.5                  | 227.58|
      | INVC    | 2022-09-30  | 300922/001       | NE057           | 1015                  | Yes          | 20                    | 10.5                  | 236.81|
      | INVC    | 2022-09-30  | 300922/001       | RD002           | 1131                  | No           | 20                    | 10.5                  | 264.30|
      | INVC    | 2022-09-30  | 300922/001       | RD006           | 1132                  | Yes          | 20                    | 10.5                  | 298.36|
      | INVC    | 2022-09-30  | 300922/001       | RD014           | 1133                  | No           | 20                    | 10.5                  | 243.32|
      | INVC    | 2022-09-30  | 300922/001       | RD017           | 1134                  | Yes          | 20                    | 10.5                  | 251.92|
      | INVC    | 2022-09-30  | 300922/001       | RD904           | 1135                  | No           | 20                    | 10.5                  | 247.51|
      | INVC    | 2022-09-30  | 300922/001       | RD026           | 1136                  | Yes          | 20                    | 10.5                  | 292.21|
      | INVC    | 2022-09-30  | 300922/001       | RD039           | 1137                  | No           | 20                    | 10.5                  | 241.02|
      | INVC    | 2022-09-30  | 300922/001       | RD030           | 1138                  | Yes          | 20                    | 10.5                  | 312.36|
      | INVC    | 2022-09-30  | 300922/001       | RD061           | 1139                  | No           | 20                    | 10.5                  | 224.94|
      | INVC    | 2022-09-30  | 300922/001       | RD050           | 1140                  | Yes          | 20                    | 10.5                  | 299.78|
      | INVC    | 2022-09-30  | 300922/001       | RD054           | 1141                  | No           | 20                    | 10.5                  | 266.03|
      | INVC    | 2022-09-30  | 300922/001       | RD068           | 1142                  | Yes          | 20                    | 10.5                  | 260.84|
      | INVC    | 2022-09-30  | 300922/001       | RD087           | 1143                  | No           | 20                    | 10.5                  | 226.73|
      | INVC    | 2022-09-30  | 300922/001       | RD913           | 1144                  | Yes          | 20                    | 10.5                  | 320.86|
      | INVC    | 2022-09-30  | 300922/001       | RD080           | 1145                  | No           | 20                    | 10.5                  | 252.63|
      | INVC    | 2022-09-30  | 300922/001       | LS003           | 1201                  | Yes          | 20                    | 10.5                  | 209.40|
      | INVC    | 2022-09-30  | 300922/001       | LS005           | 1202                  | No           | 20                    | 10.5                  | 189.81|
      | INVC    | 2022-09-30  | 300922/001       | LS015           | 1203                  | Yes          | 20                    | 10.5                  | 235.56|
      | INVC    | 2022-09-30  | 300922/001       | LS020           | 1204                  | No           | 20                    | 10.5                  | 228.63|
      | INVC    | 2022-09-30  | 300922/001       | LS024           | 1205                  | Yes          | 20                    | 10.5                  | 275.86|
      | INVC    | 2022-09-30  | 300922/001       | LS025           | 1206                  | No           | 20                    | 10.5                  | 244.59|
      | INVC    | 2022-09-30  | 300922/001       | LS033           | 1207                  | Yes          | 20                    | 10.5                  | 277.99|
      | INVC    | 2022-09-30  | 300922/001       | LS907           | 1208                  | No           | 20                    | 10.5                  | 228.63|
      | INVC    | 2022-09-30  | 300922/001       | LS042           | 1209                  | Yes          | 20                    | 10.5                  | 234.30|
      | INVC    | 2022-09-30  | 300922/001       | LS044           | 1210                  | No           | 20                    | 10.5                  | 192.80|
      | INVC    | 2022-09-30  | 300922/001       | LS046           | 1211                  | Yes          | 20                    | 10.5                  | 244.37|
      | INVC    | 2022-09-30  | 300922/001       | LS050           | 1212                  | No           | 20                    | 10.5                  | 206.60|
      | INVC    | 2022-09-30  | 300922/001       | LS057           | 1213                  | Yes          | 20                    | 10.5                  | 235.56|
      | INVC    | 2022-09-30  | 300922/001       | LS073           | 1214                  | No           | 20                    | 10.5                  | 210.79|
      | INVC    | 2022-09-30  | 300922/001       | LS082           | 1215                  | Yes          | 20                    | 10.5                  | 254.45|
      | INVC    | 2022-09-30  | 300922/001       | LS084           | 1216                  | No           | 20                    | 10.5                  | 224.05|
      | INVC    | 2022-09-30  | 300922/001       | LS089           | 1217                  | Yes          | 20                    | 10.5                  | 226.56|
      | INVC    | 2022-09-30  | 300922/001       | LS093           | 1218                  | No           | 20                    | 10.5                  | 207.08|
      | INVC    | 2022-09-30  | 300922/001       | LS094           | 1219                  | Yes          | 20                    | 10.5                  | 211.62|
      | INVC    | 2022-09-30  | 300922/001       | LS106           | 1220                  | No           | 20                    | 10.5                  | 200.30|
      | INVC    | 2022-09-30  | 300922/001       | LS109           | 1221                  | Yes          | 20                    | 10.5                  | 222.97|
      | INVC    | 2022-09-30  | 300922/001       | LS122           | 1222                  | No           | 20                    | 10.5                  | 186.54|
      | INVC    | 2022-09-30  | 300922/001       | LS128           | 1223                  | Yes          | 20                    | 10.5                  | 216.66|
      | INVC    | 2022-09-30  | 300922/001       | LN002           | 1301                  | No           | 20                    | 10.5                  | 282.15|
      | INVC    | 2022-09-30  | 300922/001       | LN006           | 1302                  | Yes          | 20                    | 10.5                  | 301.03|
      | INVC    | 2022-09-30  | 300922/001       | LN010           | 1303                  | No           | 20                    | 10.5                  | 293.69|
      | INVC    | 2022-09-30  | 300922/001       | LN016           | 1304                  | Yes          | 20                    | 10.5                  | 326.22|
      | INVC    | 2022-09-30  | 300922/001       | LN022           | 1305                  | No           | 20                    | 10.5                  | 280.05|
      | INVC    | 2022-09-30  | 300922/001       | LN027           | 1306                  | Yes          | 20                    | 10.5                  | 316.15|
      | INVC    | 2022-09-30  | 300922/001       | LN034           | 1307                  | No           | 20                    | 10.5                  | 275.85|
      | INVC    | 2022-09-30  | 300922/001       | LN907           | 1308                  | Yes          | 20                    | 10.5                  | 351.41|
      | INVC    | 2022-09-30  | 300922/001       | LN071           | 1309                  | No           | 20                    | 10.5                  | 279.00|
      | INVC    | 2022-09-30  | 300922/001       | LN083           | 1310                  | Yes          | 20                    | 10.5                  | 322.44|
      | INVC    | 2022-09-30  | 300922/001       | LN088           | 1311                  | No           | 20                    | 10.5                  | 288.44|
      | INVC    | 2022-09-30  | 300922/001       | LN091           | 1312                  | Yes          | 20                    | 10.5                  | 324.96|
      | INVC    | 2022-09-30  | 300922/001       | LN912           | 1313                  | No           | 20                    | 10.5                  | 264.30|
      | INVC    | 2022-09-30  | 300922/001       | LN110           | 1314                  | Yes          | 20                    | 10.5                  | 335.04|
      | INVC    | 2022-09-30  | 300922/001       | LN114           | 1315                  | No           | 20                    | 10.5                  | 275.85|
      | INVC    | 2022-09-30  | 300922/001       | LN120           | 1316                  | Yes          | 20                    | 10.5                  | 306.07|
      | INVC    | 2022-09-30  | 300922/001       | LN204           | 1317                  | No           | 20                    | 10.5                  | 339.86|
      | INVC    | 2022-09-30  | 300922/001       | LN125           | 1318                  | Yes          | 20                    | 10.5                  | 328.74|
      | INVC    | 2022-09-30  | 300922/001       | LN917           | 1319                  | No           | 20                    | 10.5                  | 288.44|
      | INVC    | 2022-09-30  | 300922/001       | LN141           | 1320                  | Yes          | 20                    | 10.5                  | 338.82|
      | INVC    | 2022-09-30  | 300922/001       | LN145           | 1321                  | No           | 20                    | 10.5                  | 276.90|
      | INVC    | 2022-09-30  | 300922/001       | LN151           | 1322                  | Yes          | 20                    | 10.5                  | 326.22|
      | INVC    | 2022-09-30  | 300922/001       | LN153           | 1323                  | No           | 20                    | 10.5                  | 283.20|
      | INVC    | 2022-09-30  | 300922/001       | LN922           | 1324                  | Yes          | 20                    | 10.5                  | 356.45|
      | INVC    | 2022-09-30  | 300922/001       | LN167           | 1325                  | No           | 20                    | 10.5                  | 288.44|
      | INVC    | 2022-09-30  | 300922/001       | LN170           | 1326                  | Yes          | 20                    | 10.5                  | 324.96|
      | INVC    | 2022-09-30  | 300922/001       | LN177           | 1327                  | No           | 20                    | 10.5                  | 274.80|
      | INVC    | 2022-09-30  | 300922/001       | LN181           | 1328                  | Yes          | 20                    | 10.5                  | 345.11|
      | INVC    | 2022-09-30  | 300922/001       | LN927           | 1329                  | No           | 20                    | 10.5                  | 266.41|
      | INVC    | 2022-09-30  | 300922/001       | LN197           | 1330                  | Yes          | 20                    | 10.5                  | 306.07|
      | INVC    | 2022-09-30  | 300922/001       | LN200           | 1331                  | No           | 20                    | 10.5                  | 294.74|
      | INVC    | 2022-09-30  | 300922/001       | LN203           | 1332                  | Yes          | 20                    | 10.5                  | 332.51|
      | INVC    | 2022-09-30  | 300922/001       | BR001           | 2001                  | No           | 20                    | 10.5                  | 228.63|
      | INVC    | 2022-09-30  | 300922/001       | BR902           | 2002                  | Yes          | 20                    | 10.5                  | 290.86|
      | INVC    | 2022-09-30  | 300922/001       | BR013           | 2003                  | No           | 20                    | 10.5                  | 273.17|
      | INVC    | 2022-09-30  | 300922/001       | BR022           | 2004                  | Yes          | 20                    | 10.5                  | 244.78|
      | INVC    | 2022-09-30  | 300922/001       | BR904           | 2005                  | No           | 20                    | 10.5                  | 232.83|
      | INVC    | 2022-09-30  | 300922/001       | BR042           | 2006                  | Yes          | 20                    | 10.5                  | 274.91|
      | INVC    | 2022-09-30  | 300922/001       | BR906           | 2007                  | No           | 20                    | 10.5                  | 233.88|
      | INVC    | 2022-09-30  | 300922/001       | BR055           | 2008                  | Yes          | 20                    | 10.5                  | 224.40|
      | INVC    | 2022-09-30  | 300922/001       | BR058           | 2009                  | No           | 20                    | 10.5                  | 200.30|
      | INVC    | 2022-09-30  | 300922/001       | BR909           | 2010                  | Yes          | 20                    | 10.5                  | 225.48|
      | INVC    | 2022-09-30  | 300922/001       | BR068           | 2011                  | No           | 20                    | 10.5                  | 224.43|
      | INVC    | 2022-09-30  | 300922/001       | BR079           | 2012                  | Yes          | 20                    | 10.5                  | 283.36|
      | INVC    | 2022-09-30  | 300922/001       | BR089           | 2013                  | No           | 20                    | 10.5                  | 221.28|
      | INVC    | 2022-09-30  | 300922/001       | BR099           | 2014                  | Yes          | 20                    | 10.5                  | 241.85|
      | INVC    | 2022-09-30  | 300922/001       | BR101           | 2015                  | No           | 20                    | 10.5                  | 202.40|
      | INVC    | 2022-09-30  | 300922/001       | BR106           | 2016                  | Yes          | 20                    | 10.5                  | 269.56|
      | INVC    | 2022-09-30  | 300922/001       | BR108           | 2017                  | No           | 20                    | 10.5                  | 224.05|
      | INVC    | 2022-09-30  | 300922/001       | BR917           | 2018                  | Yes          | 20                    | 10.5                  | 237.26|
      | INVC    | 2022-09-30  | 300922/001       | BR133           | 2019                  | No           | 20                    | 10.5                  | 230.31|
      | INVC    | 2022-09-30  | 300922/001       | BR148           | 2020                  | Yes          | 20                    | 10.5                  | 298.52|
      | INVC    | 2022-09-30  | 300922/001       | BR920           | 2021                  | No           | 20                    | 10.5                  | 228.63|
      | INVC    | 2022-09-30  | 300922/001       | BR180           | 2022                  | Yes          | 20                    | 10.5                  | 249.18|
      | INVC    | 2022-09-30  | 300922/001       | BM001           | 3001                  | No           | 20                    | 10.5                  | 228.63|
      | INVC    | 2022-09-30  | 300922/001       | BM282           | 3002                  | Yes          | 20                    | 10.5                  | 269.56|
      | INVC    | 2022-09-30  | 300922/001       | BM032           | 3003                  | No           | 20                    | 10.5                  | 222.33|
      | INVC    | 2022-09-30  | 300922/001       | BM039           | 3004                  | Yes          | 20                    | 10.5                  | 270.48|
      | INVC    | 2022-09-30  | 300922/001       | BM904           | 3005                  | No           | 20                    | 10.5                  | 202.62|
      | INVC    | 2022-09-30  | 300922/001       | BM088           | 3006                  | Yes          | 20                    | 10.5                  | 298.36|
      | INVC    | 2022-09-30  | 300922/001       | BM906           | 3007                  | No           | 20                    | 10.5                  | 214.99|
      | INVC    | 2022-09-30  | 300922/001       | BM286           | 3008                  | Yes          | 20                    | 10.5                  | 262.00|
      | INVC    | 2022-09-30  | 300922/001       | BM125           | 3009                  | No           | 20                    | 10.5                  | 232.09|
      | INVC    | 2022-09-30  | 300922/001       | BM909           | 3010                  | Yes          | 20                    | 10.5                  | 267.04|
      | INVC    | 2022-09-30  | 300922/001       | BM291           | 3011                  | No           | 20                    | 10.5                  | 226.53|
      | INVC    | 2022-09-30  | 300922/001       | BM225           | 3012                  | Yes          | 20                    | 10.5                  | 262.99|
      | INVC    | 2022-09-30  | 300922/001       | BM154           | 3013                  | No           | 20                    | 10.5                  | 228.63|
      | INVC    | 2022-09-30  | 300922/001       | BM220           | 3014                  | Yes          | 20                    | 10.5                  | 269.56|
      | INVC    | 2022-09-30  | 300922/001       | BM203           | 3015                  | No           | 20                    | 10.5                  | 239.23|
      | INVC    | 2022-09-30  | 300922/001       | BM207           | 3016                  | Yes          | 20                    | 10.5                  | 236.21|
      | INVC    | 2022-09-30  | 300922/001       | WA001           | 4001                  | No           | 20                    | 10.5                  | 228.63|
      | INVC    | 2022-09-30  | 300922/001       | WA003           | 4002                  | Yes          | 20                    | 10.5                  | 302.65|
      | INVC    | 2022-09-30  | 300922/001       | WA008           | 4003                  | No           | 20                    | 10.5                  | 183.51|
      | INVC    | 2022-09-30  | 300922/001       | WA010           | 4004                  | Yes          | 20                    | 10.5                  | 304.79|
      | INVC    | 2022-09-30  | 300922/001       | WA904           | 4005                  | No           | 20                    | 10.5                  | 202.62|
      | INVC    | 2022-09-30  | 300922/001       | WA020           | 4006                  | Yes          | 20                    | 10.5                  | 305.86|
      | INVC    | 2022-09-30  | 300922/001       | WA026           | 4007                  | No           | 20                    | 10.5                  | 216.04|
      | INVC    | 2022-09-30  | 300922/001       | WA907           | 4008                  | Yes          | 20                    | 10.5                  | 258.23|
      | INVC    | 2022-09-30  | 300922/001       | WA908           | 4009                  | No           | 20                    | 10.5                  | 216.04|
      | INVC    | 2022-09-30  | 300922/001       | WA039           | 4010                  | Yes          | 20                    | 10.5                  | 269.56|
      | INVC    | 2022-09-30  | 300922/001       | WA050           | 4011                  | No           | 20                    | 10.5                  | 241.91|
      | INVC    | 2022-09-30  | 300922/001       | WA052           | 4012                  | Yes          | 20                    | 10.5                  | 263.27|
      | INVC    | 2022-09-30  | 300922/001       | WA060           | 4013                  | No           | 20                    | 10.5                  | 241.02|
      | INVC    | 2022-09-30  | 300922/001       | WA062           | 4014                  | Yes          | 20                    | 10.5                  | 284.42|
      | INVC    | 2022-09-30  | 300922/001       | WA067           | 4015                  | No           | 20                    | 10.5                  | 228.63|
      | INVC    | 2022-09-30  | 300922/001       | WA073           | 4016                  | Yes          | 20                    | 10.5                  | 296.22|
      | INVC    | 2022-09-30  | 300922/001       | WA916           | 4017                  | No           | 20                    | 10.5                  | 177.61|
      | INVC    | 2022-09-30  | 300922/001       | WA078           | 4018                  | Yes          | 20                    | 10.5                  | 246.91|
      | INVC    | 2022-09-30  | 300922/001       | WA918           | 4019                  | No           | 20                    | 10.5                  | 228.63|
      | INVC    | 2022-09-30  | 300922/001       | WA099           | 4020                  | Yes          | 20                    | 10.5                  | 311.22|
      | INVC    | 2022-09-30  | 300922/001       | WA103           | 4021                  | No           | 20                    | 10.5                  | 228.63|
      | INVC    | 2022-09-30  | 300922/001       | WA108           | 4022                  | Yes          | 20                    | 10.5                  | 269.56|
      | INVC    | 2022-09-30  | 300922/001       | WA922           | 4023                  | No           | 20                    | 10.5                  | 228.63|
      | INVC    | 2022-09-30  | 300922/001       | WA119           | 4024                  | Yes          | 20                    | 10.5                  | 326.22|
      | INVC    | 2022-09-30  | 300922/001       | WA123           | 4025                  | No           | 20                    | 10.5                  | 228.63|
      | INVC    | 2022-09-30  | 300922/001       | WA127           | 4026                  | Yes          | 20                    | 10.5                  | 273.34|
      | INVC    | 2022-09-30  | 300922/001       | WA131           | 4027                  | No           | 20                    | 10.5                  | 221.28|
      | INVC    | 2022-09-30  | 300922/001       | LV900           | 5001                  | Yes          | 20                    | 10.5                  | 248.15|
      | INVC    | 2022-09-30  | 300922/001       | LV029           | 5002                  | No           | 20                    | 10.5                  | 180.30|
      | INVC    | 2022-09-30  | 300922/001       | LV018           | 5003                  | Yes          | 20                    | 10.5                  | 271.57|
      | INVC    | 2022-09-30  | 300922/001       | LV030           | 5004                  | No           | 20                    | 10.5                  | 200.30|
      | INVC    | 2022-09-30  | 300922/001       | LV901           | 5005                  | Yes          | 20                    | 10.5                  | 251.92|
      | INVC    | 2022-09-30  | 300922/001       | LV036           | 5006                  | No           | 20                    | 10.5                  | 205.54|
      | INVC    | 2022-09-30  | 300922/001       | MA001           | 6001                  | Yes          | 20                    | 10.5                  | 267.04|
      | INVC    | 2022-09-30  | 300922/001       | MA019           | 6002                  | No           | 20                    | 10.5                  | 201.72|
      | INVC    | 2022-09-30  | 300922/001       | MA022           | 6003                  | Yes          | 20                    | 10.5                  | 245.84|
      | INVC    | 2022-09-30  | 300922/001       | MA035           | 6004                  | No           | 20                    | 10.5                  | 200.84|
      | INVC    | 2022-09-30  | 300922/001       | MA044           | 6005                  | Yes          | 20                    | 10.5                  | 276.92|
      | INVC    | 2022-09-30  | 300922/001       | MA056           | 6006                  | No           | 20                    | 10.5                  | 223.16|
      | INVC    | 2022-09-30  | 300922/001       | MA100           | 6007                  | Yes          | 20                    | 10.5                  | 222.26|
      | INVC    | 2022-09-30  | 300922/001       | MA113           | 6008                  | No           | 20                    | 10.5                  | 228.63|
      | INVC    | 2022-09-30  | 300922/001       | MA123           | 6009                  | Yes          | 20                    | 10.5                  | 255.48|
      | INVC    | 2022-09-30  | 300922/001       | MA129           | 6010                  | No           | 20                    | 10.5                  | 228.63|
      | INVC    | 2022-09-30  | 300922/001       | MA136           | 6011                  | Yes          | 20                    | 10.5                  | 269.56|
      | INVC    | 2022-09-30  | 300922/001       | MA911           | 6012                  | No           | 20                    | 10.5                  | 213.34|
      | INVC    | 2022-09-30  | 300922/001       | MA152           | 6013                  | Yes          | 20                    | 10.5                  | 244.78|
      | INVC    | 2022-09-30  | 300922/001       | MA158           | 6014                  | No           | 20                    | 10.5                  | 219.58|
      | INVC    | 2022-09-30  | 300922/001       | MA166           | 6015                  | Yes          | 20                    | 10.5                  | 257.64|
      | INVC    | 2022-09-30  | 300922/001       | MA175           | 6016                  | No           | 20                    | 10.5                  | 203.45|
      | INVC    | 2022-09-30  | 300922/001       | MA179           | 6017                  | Yes          | 20                    | 10.5                  | 213.70|
      | INVC    | 2022-09-30  | 300922/001       | MA187           | 6018                  | No           | 20                    | 10.5                  | 210.66|
      | INVC    | 2022-09-30  | 300922/001       | MA918           | 6019                  | Yes          | 20                    | 10.5                  | 269.56|
      | INVC    | 2022-09-30  | 300922/001       | MA199           | 6020                  | No           | 20                    | 10.5                  | 169.57|
      | INVC    | 2022-09-30  | 300922/001       | MA208           | 6021                  | Yes          | 20                    | 10.5                  | 202.97|
      | INVC    | 2022-09-30  | 300922/001       | MA210           | 6022                  | No           | 20                    | 10.5                  | 207.08|
      | INVC    | 2022-09-30  | 300922/001       | MA213           | 6023                  | Yes          | 20                    | 10.5                  | 265.13|
      | INVC    | 2022-09-30  | 300922/001       | MA923           | 6024                  | No           | 20                    | 10.5                  | 188.34|
      | INVC    | 2022-09-30  | 300922/001       | BG020           | 7001                  | Yes          | 20                    | 10.5                  | 345.52|
      | INVC    | 2022-09-30  | 300922/001       | BG001           | 7002                  | No           | 20                    | 10.5                  | 260.11|
      | INVC    | 2022-09-30  | 300922/001       | BG027           | 7003                  | Yes          | 20                    | 10.5                  | 306.92|
      | INVC    | 2022-09-30  | 300922/001       | BG035           | 7004                  | No           | 20                    | 10.5                  | 303.53|
      | INVC    | 2022-09-30  | 300922/001       | BG024           | 7005                  | Yes          | 20                    | 10.5                  | 323.00|
      | INVC    | 2022-09-30  | 300922/001       | BG014           | 7006                  | No           | 20                    | 10.5                  | 228.63|
      | INVC    | 2022-09-30  | 300922/001       | BG037           | 7007                  | Yes          | 20                    | 10.5                  | 311.22|
      | INVC    | 2022-09-30  | 300922/001       | BG045           | 7008                  | No           | 20                    | 10.5                  | 230.72|
      | INVC    | 2022-09-30  | 300922/001       | BG052           | 7009                  | Yes          | 20                    | 10.5                  | 294.74|
      | INVC    | 2022-09-30  | 300922/001       | BG058           | 7010                  | No           | 20                    | 10.5                  | 262.21|
      | INVC    | 2022-09-30  | 300922/001       | BG043           | 7011                  | Yes          | 20                    | 10.5                  | 313.63|
      | INVC    | 2022-09-30  | 300922/001       | BG060           | 7012                  | No           | 20                    | 10.5                  | 301.04|
      | INVC    | 2022-09-30  | 300922/001       | BG066           | 7013                  | Yes          | 20                    | 10.5                  | 277.10|
      | INVC    | 2022-09-30  | 300922/001       | BG070           | 7014                  | No           | 20                    | 10.5                  | 210.79|
      | INVC    | 2022-09-30  | 300922/001       | BG081           | 7015                  | Yes          | 20                    | 10.5                  | 339.08|
      | INVC    | 2022-09-30  | 300922/001       | BG087           | 7016                  | No           | 20                    | 10.5                  | 187.70|
      | INVC    | 2022-09-30  | 300922/001       | BG092           | 7017                  | Yes          | 20                    | 10.5                  | 250.67|
      | INVC    | 2022-09-30  | 300922/001       | BG083           | 7018                  | No           | 20                    | 10.5                  | 223.16|
      | INVC    | 2022-09-30  | 300922/001       | NT002           | 8001                  | Yes          | 20                    | 10.5                  | 309.07|
      | INVC    | 2022-09-30  | 300922/001       | NT015           | 8002                  | No           | 20                    | 10.5                  | 242.81|
      | INVC    | 2022-09-30  | 300922/001       | NT021           | 8003                  | Yes          | 20                    | 10.5                  | 269.42|
      | INVC    | 2022-09-30  | 300922/001       | NT023           | 8004                  | No           | 20                    | 10.5                  | 228.63|
      | INVC    | 2022-09-30  | 300922/001       | NT033           | 8005                  | Yes          | 20                    | 10.5                  | 274.78|
      | INVC    | 2022-09-30  | 300922/001       | NT905           | 8006                  | No           | 20                    | 10.5                  | 228.63|
      | INVC    | 2022-09-30  | 300922/001       | NT052           | 8007                  | Yes          | 20                    | 10.5                  | 302.65|
      | INVC    | 2022-09-30  | 300922/001       | NT060           | 8008                  | No           | 20                    | 10.5                  | 223.39|
      | INVC    | 2022-09-30  | 300922/001       | NT067           | 8009                  | Yes          | 20                    | 10.5                  | 239.40|
      | INVC    | 2022-09-30  | 300922/001       | NT122           | 8010                  | No           | 20                    | 10.5                  | 209.76|
      | INVC    | 2022-09-30  | 300922/001       | NT082           | 8011                  | Yes          | 20                    | 10.5                  | 244.37|
      | INVC    | 2022-09-30  | 300922/001       | NT085           | 8012                  | No           | 20                    | 10.5                  | 208.69|
      | INVC    | 2022-09-30  | 300922/001       | NT087           | 8013                  | Yes          | 20                    | 10.5                  | 272.64|
      | INVC    | 2022-09-30  | 300922/001       | NT089           | 8014                  | No           | 20                    | 10.5                  | 230.31|
      | INVC    | 2022-09-30  | 300922/001       | NT111           | 8015                  | Yes          | 20                    | 10.5                  | 259.49|
      | INVC    | 2022-09-30  | 300922/001       | NT115           | 8016                  | No           | 20                    | 10.5                  | 205.30|
      | INVC    | 2022-09-30  | 300922/001       | NT118           | 8017                  | Yes          | 20                    | 10.5                  | 259.78|
      | INVC    | 2022-09-30  | 300922/001       | EA144           | 9001                  | No           | 20                    | 10.5                  | 217.09|
      | INVC    | 2022-09-30  | 300922/001       | EA004           | 9002                  | Yes          | 20                    | 10.5                  | 269.56|
      | INVC    | 2022-09-30  | 300922/001       | EA011           | 9003                  | No           | 20                    | 10.5                  | 210.79|
      | INVC    | 2022-09-30  | 300922/001       | EA012           | 9004                  | Yes          | 20                    | 10.5                  | 269.56|
      | INVC    | 2022-09-30  | 300922/001       | EA014           | 9005                  | No           | 20                    | 10.5                  | 223.16|
      | INVC    | 2022-09-30  | 300922/001       | EA145           | 9006                  | Yes          | 20                    | 10.5                  | 260.84|
      | INVC    | 2022-09-30  | 300922/001       | EA022           | 9007                  | No           | 20                    | 10.5                  | 188.34|
      | INVC    | 2022-09-30  | 300922/001       | EA907           | 9008                  | Yes          | 20                    | 10.5                  | 269.56|
      | INVC    | 2022-09-30  | 300922/001       | EA028           | 9009                  | No           | 20                    | 10.5                  | 310.48|
      | INVC    | 2022-09-30  | 300922/001       | EA032           | 9010                  | Yes          | 20                    | 10.5                  | 298.52|
      | INVC    | 2022-09-30  | 300922/001       | EA037           | 9011                  | No           | 20                    | 10.5                  | 228.63|
      | INVC    | 2022-09-30  | 300922/001       | EA045           | 9012                  | Yes          | 20                    | 10.5                  | 345.11|
      | INVC    | 2022-09-30  | 300922/001       | EA049           | 9013                  | No           | 20                    | 10.5                  | 291.59|
      | INVC    | 2022-09-30  | 300922/001       | EA054           | 9014                  | Yes          | 20                    | 10.5                  | 379.12|
      | INVC    | 2022-09-30  | 300922/001       | EA055           | 9015                  | No           | 20                    | 10.5                  | 216.02|
      | INVC    | 2022-09-30  | 300922/001       | EA062           | 9016                  | Yes          | 20                    | 10.5                  | 267.04|
      | INVC    | 2022-09-30  | 300922/001       | EA149           | 9017                  | No           | 20                    | 10.5                  | 265.36|
      | INVC    | 2022-09-30  | 300922/001       | EA069           | 9018                  | Yes          | 20                    | 10.5                  | 375.34|
      | INVC    | 2022-09-30  | 300922/001       | EA150           | 9019                  | No           | 20                    | 10.5                  | 295.79|
      | INVC    | 2022-09-30  | 300922/001       | EA081           | 9020                  | Yes          | 20                    | 10.5                  | 319.93|
      | INVC    | 2022-09-30  | 300922/001       | EA083           | 9021                  | No           | 20                    | 10.5                  | 266.41|
      | INVC    | 2022-09-30  | 300922/001       | EA091           | 9022                  | Yes          | 20                    | 10.5                  | 278.38|
      | INVC    | 2022-09-30  | 300922/001       | EA096           | 9023                  | No           | 20                    | 10.5                  | 217.80|
      | INVC    | 2022-09-30  | 300922/001       | EA099           | 9024                  | Yes          | 20                    | 10.5                  | 251.21|
      | INVC    | 2022-09-30  | 300922/001       | EA107           | 9025                  | No           | 20                    | 10.5                  | 218.70|
      | INVC    | 2022-09-30  | 300922/001       | EA132           | 9026                  | Yes          | 20                    | 10.5                  | 265.78|
      | INVC    | 2022-09-30  | 300922/001       | EA115           | 9027                  | No           | 20                    | 10.5                  | 251.71|
      | INVC    | 2022-09-30  | 300922/001       | EA118           | 9028                  | Yes          | 20                    | 10.5                  | 257.64|
      | INVC    | 2022-09-30  | 300922/001       | EA127           | 9029                  | No           | 20                    | 10.5                  | 222.27|
      | INVC    | 2022-09-30  | 300922/001       | EA131           | 9030                  | Yes          | 20                    | 10.5                  | 269.56|

    @police_station_work_all_INVC_3
    Examples: Police station work all INVC codes 06-12-24
      | feeCode | startDate   | uniqueFileNumber | policeStationId | policeStationSchemeId | vatIndicator | netDisbursementAmount  | disbursementVatAmount  | expectedTotal |
      | INVC    | 2024-12-06  | 061224/001       | NE001           | 1001                  | Yes          | 20                     | 10.5                   | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | NE005           | 1002                  | No           | 20                     | 10.5                   | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | NE010           | 1003                  | Yes          | 20                     | 10.5                   | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | NE016           | 1004                  | No           | 20                     | 10.5                   | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | NE019           | 1005                  | Yes          | 20                     | 10.5                   | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | NE021           | 1006                  | No           | 20                     | 10.5                   | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | NE906           | 1007                  | Yes          | 20                     | 10.5                   | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | NE027           | 1008                  | No           | 20                     | 10.5                   | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | NE032           | 1009                  | Yes          | 20                     | 10.5                   | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | NE040           | 1010                  | No           | 20                     | 10.5                   | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | NE044           | 1011                  | Yes          | 20                     | 10.5                   | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | NE045           | 1012                  | No           | 20                     | 10.5                   | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | NE051           | 1013                  | Yes          | 20                     | 10.5                   | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | NE053           | 1014                  | No           | 20                     | 10.5                   | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | NE057           | 1015                  | Yes          | 20                     | 10.5                   | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | RD002           | 1131                  | No           | 20                     | 10.5                   | 264.30|
      | INVC    | 2024-12-06  | 061224/001       | RD006           | 1132                  | Yes          | 20                     | 10.5                   | 298.36|
      | INVC    | 2024-12-06  | 061224/001       | RD014           | 1133                  | No           | 20                     | 10.5                   | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | RD017           | 1134                  | Yes          | 20                     | 10.5                   | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | RD904           | 1135                  | No           | 20                     | 10.5                   | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | RD026           | 1136                  | Yes          | 20                     | 10.5                   | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | RD039           | 1137                  | No           | 20                     | 10.5                   | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | RD030           | 1138                  | Yes          | 20                     | 10.5                   | 312.36|
      | INVC    | 2024-12-06  | 061224/001       | RD061           | 1139                  | No           | 20                     | 10.5                   | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | RD050           | 1140                  | Yes          | 20                     | 10.5                   | 299.78|
      | INVC    | 2024-12-06  | 061224/001       | RD054           | 1141                  | No           | 20                     | 10.5                   | 266.03|
      | INVC    | 2024-12-06  | 061224/001       | RD068           | 1142                  | Yes          | 20                     | 10.5                   | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | RD087           | 1143                  | No           | 20                     | 10.5                   | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | RD913           | 1144                  | Yes          | 20                     | 10.5                   | 320.86|
      | INVC    | 2024-12-06  | 061224/001       | RD080           | 1145                  | No           | 20                     | 10.5                   | 252.63|
      | INVC    | 2024-12-06  | 061224/001       | LS003           | 1201                  | Yes          | 20                     | 10.5                   | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | LS005           | 1202                  | No           | 20                     | 10.5                   | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | LS015           | 1203                  | Yes          | 20                     | 10.5                   | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | LS020           | 1204                  | No           | 20                     | 10.5                   | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | LS024           | 1205                  | Yes          | 20                     | 10.5                   | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | LS025           | 1206                  | No           | 20                     | 10.5                   | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | LS033           | 1207                  | Yes          | 20                     | 10.5                   | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | LS907           | 1208                  | No           | 20                     | 10.5                   | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | LS042           | 1209                  | Yes          | 20                     | 10.5                   | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | LS044           | 1210                  | No           | 20                     | 10.5                   | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | LS046           | 1211                  | Yes          | 20                     | 10.5                   | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | LS050           | 1212                  | No           | 20                     | 10.5                   | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | LS057           | 1213                  | Yes          | 20                     | 10.5                   | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | LS073           | 1214                  | No           | 20                     | 10.5                   | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | LS082           | 1215                  | Yes          | 20                     | 10.5                   | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | LS084           | 1216                  | No           | 20                     | 10.5                   | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | LS089           | 1217                  | Yes          | 20                     | 10.5                   | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | LS093           | 1218                  | No           | 20                     | 10.5                   | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | LS094           | 1219                  | Yes          | 20                     | 10.5                   | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | LS106           | 1220                  | No           | 20                     | 10.5                   | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | LS109           | 1221                  | Yes          | 20                     | 10.5                   | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | LS122           | 1222                  | No           | 20                     | 10.5                   | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | LS128           | 1223                  | Yes          | 20                     | 10.5                   | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | LN002           | 1301                  | No           | 20                     | 10.5                   | 288.45|
      | INVC    | 2024-12-06  | 061224/001       | LN006           | 1302                  | Yes          | 20                     | 10.5                   | 341.34|
      | INVC    | 2024-12-06  | 061224/001       | LN010           | 1303                  | No           | 20                     | 10.5                   | 293.69|
      | INVC    | 2024-12-06  | 061224/001       | LN016           | 1304                  | Yes          | 20                     | 10.5                   | 341.34|
      | INVC    | 2024-12-06  | 061224/001       | LN022           | 1305                  | No           | 20                     | 10.5                   | 288.45|
      | INVC    | 2024-12-06  | 061224/001       | LN027           | 1306                  | Yes          | 20                     | 10.5                   | 341.34|
      | INVC    | 2024-12-06  | 061224/001       | LN034           | 1307                  | No           | 20                     | 10.5                   | 288.45|
      | INVC    | 2024-12-06  | 061224/001       | LN907           | 1308                  | Yes          | 20                     | 10.5                   | 351.41|
      | INVC    | 2024-12-06  | 061224/001       | LN071           | 1309                  | No           | 20                     | 10.5                   | 288.45|
      | INVC    | 2024-12-06  | 061224/001       | LN083           | 1310                  | Yes          | 20                     | 10.5                   | 341.34|
      | INVC    | 2024-12-06  | 061224/001       | LN088           | 1311                  | No           | 20                     | 10.5                   | 288.45|
      | INVC    | 2024-12-06  | 061224/001       | LN091           | 1312                  | Yes          | 20                     | 10.5                   | 341.34|
      | INVC    | 2024-12-06  | 061224/001       | LN912           | 1313                  | No           | 20                     | 10.5                   | 288.45|
      | INVC    | 2024-12-06  | 061224/001       | LN110           | 1314                  | Yes          | 20                     | 10.5                   | 341.34|
      | INVC    | 2024-12-06  | 061224/001       | LN114           | 1315                  | No           | 20                     | 10.5                   | 288.45|
      | INVC    | 2024-12-06  | 061224/001       | LN120           | 1316                  | Yes          | 20                     | 10.5                   | 341.34|
      | INVC    | 2024-12-06  | 061224/001       | LN204           | 1317                  | No           | 20                     | 10.5                   | 339.86|
      | INVC    | 2024-12-06  | 061224/001       | LN125           | 1318                  | Yes          | 20                     | 10.5                   | 341.34|
      | INVC    | 2024-12-06  | 061224/001       | LN917           | 1319                  | No           | 20                     | 10.5                   | 288.45|
      | INVC    | 2024-12-06  | 061224/001       | LN141           | 1320                  | Yes          | 20                     | 10.5                   | 341.34|
      | INVC    | 2024-12-06  | 061224/001       | LN145           | 1321                  | No           | 20                     | 10.5                   | 288.45|
      | INVC    | 2024-12-06  | 061224/001       | LN151           | 1322                  | Yes          | 20                     | 10.5                   | 341.34|
      | INVC    | 2024-12-06  | 061224/001       | LN153           | 1323                  | No           | 20                     | 10.5                   | 288.45|
      | INVC    | 2024-12-06  | 061224/001       | LN922           | 1324                  | Yes          | 20                     | 10.5                   | 356.45|
      | INVC    | 2024-12-06  | 061224/001       | LN167           | 1325                  | No           | 20                     | 10.5                   | 288.45|
      | INVC    | 2024-12-06  | 061224/001       | LN170           | 1326                  | Yes          | 20                     | 10.5                   | 341.34|
      | INVC    | 2024-12-06  | 061224/001       | LN177           | 1327                  | No           | 20                     | 10.5                   | 288.45|
      | INVC    | 2024-12-06  | 061224/001       | LN181           | 1328                  | Yes          | 20                     | 10.5                  | 345.11|
      | INVC    | 2024-12-06  | 061224/001       | LN927           | 1329                  | No           | 20                     | 10.5                  | 288.45|
      | INVC    | 2024-12-06  | 061224/001       | LN197           | 1330                  | Yes          | 20                     | 10.5                  | 341.34|
      | INVC    | 2024-12-06  | 061224/001       | LN200           | 1331                  | No           | 20                     | 10.5                  | 294.74|
      | INVC    | 2024-12-06  | 061224/001       | LN203           | 1332                  | Yes          | 20                     | 10.5                  | 341.34|
      | INVC    | 2024-12-06  | 061224/001       | BR001           | 2001                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | BR902           | 2002                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | BR013           | 2003                  | No           | 20                     | 10.5                  | 273.17|
      | INVC    | 2024-12-06  | 061224/001       | BR022           | 2004                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | BR904           | 2005                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | BR042           | 2006                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | BR906           | 2007                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | BR055           | 2008                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | BR058           | 2009                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | BR909           | 2010                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | BR068           | 2011                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | BR079           | 2012                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | BR089           | 2013                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | BR099           | 2014                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | BR101           | 2015                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | BR106           | 2016                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | BR108           | 2017                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | BR917           | 2018                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | BR133           | 2019                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | BR148           | 2020                  | Yes          | 20                     | 10.5                  | 298.52|
      | INVC    | 2024-12-06  | 061224/001       | BR920           | 2021                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | BR180           | 2022                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | BM001           | 3001                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | BM282           | 3002                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | BM032           | 3003                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | BM039           | 3004                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | BM904           | 3005                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | BM088           | 3006                  | Yes          | 20                     | 10.5                  | 298.36|
      | INVC    | 2024-12-06  | 061224/001       | BM906           | 3007                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | BM286           | 3008                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | BM125           | 3009                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | BM909           | 3010                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | BM291           | 3011                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | BM225           | 3012                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | BM154           | 3013                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | BM220           | 3014                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | BM203           | 3015                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | BM207           | 3016                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | WA001           | 4001                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | WA003           | 4002                  | Yes          | 20                     | 10.5                  | 302.65|
      | INVC    | 2024-12-06  | 061224/001       | WA008           | 4003                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | WA010           | 4004                  | Yes          | 20                     | 10.5                  | 304.79|
      | INVC    | 2024-12-06  | 061224/001       | WA904           | 4005                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | WA020           | 4006                  | Yes          | 20                     | 10.5                  | 305.86|
      | INVC    | 2024-12-06  | 061224/001       | WA026           | 4007                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | WA907           | 4008                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | WA908           | 4009                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | WA039           | 4010                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | WA050           | 4011                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | WA052           | 4012                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | WA060           | 4013                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | WA062           | 4014                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | WA067           | 4015                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | WA073           | 4016                  | Yes          | 20                     | 10.5                  | 296.22|
      | INVC    | 2024-12-06  | 061224/001       | WA916           | 4017                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | WA078           | 4018                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | WA918           | 4019                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | WA099           | 4020                  | Yes          | 20                     | 10.5                  | 311.22|
      | INVC    | 2024-12-06  | 061224/001       | WA103           | 4021                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | WA108           | 4022                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | WA922           | 4023                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | WA119           | 4024                  | Yes          | 20                     | 10.5                  | 326.22|
      | INVC    | 2024-12-06  | 061224/001       | WA123           | 4025                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | WA127           | 4026                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | WA131           | 4027                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | LV900           | 5001                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | LV029           | 5002                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | LV018           | 5003                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | LV030           | 5004                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | LV901           | 5005                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | LV036           | 5006                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | MA001           | 6001                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | MA019           | 6002                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | MA022           | 6003                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | MA035           | 6004                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | MA044           | 6005                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | MA056           | 6006                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | MA100           | 6007                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | MA113           | 6008                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | MA123           | 6009                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | MA129           | 6010                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | MA136           | 6011                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | MA911           | 6012                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | MA152           | 6013                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | MA158           | 6014                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | MA166           | 6015                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | MA175           | 6016                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | MA179           | 6017                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | MA187           | 6018                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | MA918           | 6019                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | MA199           | 6020                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | MA208           | 6021                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | MA210           | 6022                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | MA213           | 6023                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | MA923           | 6024                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | BG020           | 7001                  | Yes          | 20                     | 10.5                  | 345.52|
      | INVC    | 2024-12-06  | 061224/001       | BG001           | 7002                  | No           | 20                     | 10.5                  | 260.11|
      | INVC    | 2024-12-06  | 061224/001       | BG027           | 7003                  | Yes          | 20                     | 10.5                  | 306.92|
      | INVC    | 2024-12-06  | 061224/001       | BG035           | 7004                  | No           | 20                     | 10.5                  | 303.53|
      | INVC    | 2024-12-06  | 061224/001       | BG024           | 7005                  | Yes          | 20                     | 10.5                  | 323.00|
      | INVC    | 2024-12-06  | 061224/001       | BG014           | 7006                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | BG037           | 7007                  | Yes          | 20                     | 10.5                  | 311.22|
      | INVC    | 2024-12-06  | 061224/001       | BG045           | 7008                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | BG052           | 7009                  | Yes          | 20                     | 10.5                  | 294.74|
      | INVC    | 2024-12-06  | 061224/001       | BG058           | 7010                  | No           | 20                     | 10.5                  | 262.21|
      | INVC    | 2024-12-06  | 061224/001       | BG043           | 7011                  | Yes          | 20                     | 10.5                  | 313.63|
      | INVC    | 2024-12-06  | 061224/001       | BG060           | 7012                  | No           | 20                     | 10.5                  | 301.04|
      | INVC    | 2024-12-06  | 061224/001       | BG066           | 7013                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | BG070           | 7014                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | BG081           | 7015                  | Yes          | 20                     | 10.5                  | 339.08|
      | INVC    | 2024-12-06  | 061224/001       | BG087           | 7016                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | BG092           | 7017                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | BG083           | 7018                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | NT002           | 8001                  | Yes          | 20                     | 10.5                  | 309.07|
      | INVC    | 2024-12-06  | 061224/001       | NT015           | 8002                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | NT021           | 8003                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | NT023           | 8004                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | NT033           | 8005                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | NT905           | 8006                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | NT052           | 8007                  | Yes          | 20                     | 10.5                  | 302.65|
      | INVC    | 2024-12-06  | 061224/001       | NT060           | 8008                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | NT067           | 8009                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | NT122           | 8010                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | NT082           | 8011                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | NT085           | 8012                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | NT087           | 8013                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | NT089           | 8014                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | NT111           | 8015                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | NT115           | 8016                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | NT118           | 8017                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | EA144           | 9001                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | EA004           | 9002                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | EA011           | 9003                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | EA012           | 9004                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | EA014           | 9005                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | EA145           | 9006                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | EA022           | 9007                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | EA907           | 9008                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | EA028           | 9009                  | No           | 20                     | 10.5                  | 310.48|
      | INVC    | 2024-12-06  | 061224/001       | EA032           | 9010                  | Yes          | 20                     | 10.5                  | 298.52|
      | INVC    | 2024-12-06  | 061224/001       | EA037           | 9011                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | EA045           | 9012                  | Yes          | 20                     | 10.5                  | 345.11|
      | INVC    | 2024-12-06  | 061224/001       | EA049           | 9013                  | No           | 20                     | 10.5                  | 291.59|
      | INVC    | 2024-12-06  | 061224/001       | EA054           | 9014                  | Yes          | 20                     | 10.5                  | 379.12|
      | INVC    | 2024-12-06  | 061224/001       | EA055           | 9015                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | EA062           | 9016                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | EA149           | 9017                  | No           | 20                     | 10.5                  | 265.36|
      | INVC    | 2024-12-06  | 061224/001       | EA069           | 9018                  | Yes          | 20                     | 10.5                  | 375.34|
      | INVC    | 2024-12-06  | 061224/001       | EA150           | 9019                  | No           | 20                     | 10.5                  | 295.79|
      | INVC    | 2024-12-06  | 061224/001       | EA081           | 9020                  | Yes          | 20                     | 10.5                  | 319.93|
      | INVC    | 2024-12-06  | 061224/001       | EA083           | 9021                  | No           | 20                     | 10.5                  | 266.41|
      | INVC    | 2024-12-06  | 061224/001       | EA091           | 9022                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | EA096           | 9023                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | EA099           | 9024                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | EA107           | 9025                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | EA132           | 9026                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | EA115           | 9027                  | No           | 20                     | 10.5                  | 251.71|
      | INVC    | 2024-12-06  | 061224/001       | EA118           | 9028                  | Yes          | 20                     | 10.5                  | 292.22|
      | INVC    | 2024-12-06  | 061224/001       | EA127           | 9029                  | No           | 20                     | 10.5                  | 247.52|
      | INVC    | 2024-12-06  | 061224/001       | EA131           | 9030                  | Yes          | 20                     | 10.5                  | 292.22|


    @police_other_hourly_rate
    Examples: Police Other Hourly Rate
      | feeCode | startDate  | uniqueFileNumber | netProfitCosts | netTravelCosts | netWaitingCosts | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal |
      | INVA    | 2016-04-01 | 010416/001       | 20             | 50             | 60              | Yes          | 20                    | 10.5                  | 180.00|
      | INVA    | 2022-09-30 | 290922/002       | 100            | 40             | 100             | No           | 20                    | 10.5                  | 264.00|
      | INVA    | 2022-09-30 | 300922/003       | 40             | 100            | 50              | Yes          | 20                    | 15.5                  | 252.00|
      | INVE    | 2016-04-01 | 010416/001       | 400            | 200            | 100             | No           | 20                    | 15.5                  | 724.00|
      | INVE    | 2022-09-30 | 290922/002       | 300            | 200            | 600             | Yes          | 20                    | 10.5                  | 1344.00|
      | INVE    | 2022-09-30 | 300922/003       | 400            | 500            | 600             | No           | 20                    | 10.5                  | 1524.00|
      | INVH    | 2016-04-01 | 010416/001       | 400            | 200            | 100             | Yes          | 20                    | 15.5                  | 864.00|
      | INVH    | 2022-09-30 | 290922/002       | 300            | 200            | 600             | No           | 20                    | 15.5                  | 1124.00|
      | INVH    | 2022-09-30 | 300922/003       | 400            | 500            | 600             | Yes          | 20                    | 10.5                  | 1824.00|
      | INVK    | 2016-04-01 | 010416/001       | 400            | 200            | 100             | No           | 20                    | 10.5                  | 724.00|
      | INVK    | 2022-09-30 | 290922/002       | 300            | 200            | 600             | Yes          | 20                    | 15.5                  | 1344.00|
      | INVK    | 2022-09-30 | 300922/003       | 400            | 500            | 600             | No           | 20                    | 15.5                  | 1524.00|
      | INVL    | 2016-04-01 | 010416/001       | 400            | 200            | 100             | Yes          | 20                    | 10.5                  | 864.00|
      | INVL    | 2022-09-30 | 290922/002       | 300            | 200            | 600             | No           | 20                    | 10.5                  | 1124.00|
      | INVL    | 2022-09-30 | 300922/003       | 400            | 500            | 600             | Yes          | 20                    | 15.5                  | 1824.00|
      | INVM    | 2021-06-07 | 070621/001       | 20             | 50             | 60              | No           | 20                    | 15.5                  | 154.00|
      | INVM    | 2022-09-30 | 290922/002       | 100            | 40             | 100             | Yes          | 20                    | 10.5                  | 312.00|
      | INVM    | 2022-09-30 | 300922/003       | 40             | 100            | 50              | No           | 20                    | 10.5                  | 214.00|

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
      | PROJ5    | 2016-04-01 | 2016-04-01              |20                    | 10.50                 | true         | 0                         | 0                      | 322.45|
      | PROJ5    | 2022-09-30 | 2022-09-30              |20                    | 10.50                 | false        | 0                         | 0                      | 310.02|
      | PROJ6    | 2016-04-01 | 2016-04-01              |20                    | 15.50                 | true         | 0                         | 0                      | 266.64|
      | PROJ6    | 2022-09-30 | 2022-09-30              |20                    | 15.50                 | false        | 0                         | 0                      | 256.53|
      | PROJ7    | 2016-04-01 | 2022-09-29              |20                    | 10.50                 | true         | 0                         | 0                      | 590.17|
      | PROJ8    | 2016-04-01 | 2016-04-02              |20                    | 10.50                 | false        | 0                         | 0                      | 459.64|
      | PROK1    | 2016-04-01 | 2016-04-01              |20                    | 15.50                 | true         | 0                         | 0                      | 322.45|
      | PROK2    | 2016-04-01 | 2016-04-01              |20                    | 15.50                 | false        | 0                         | 0                      | 226.20|
      | PROK3    | 2022-09-30 | 2022-09-30              |20                    | 10.50                 | true         | 0                         | 0                      | 500.57|
      | PROL1    | 2022-09-30 | 2022-09-30              |20                    | 10.50                 | false        | 0                         | 0                      | 566.58|
      | PROL2    | 2016-04-01 | 2016-04-01              |20                    | 15.50                 | true         | 0                         | 0                      | 546.77|
      | PROL3    | 2022-09-30 | 2022-10-01              |20                    | 15.50                 | false        | 0                         | 0                      | 855.85|

    @youth_court_designated
    Examples: Youth Court Designated
      | feeCode  | startDate  | representationOrderDate |netDisbursementAmount | disbursementVatAmount | vatIndicator | numberOfMediationSessions | boltOnAdjournedHearing | expectedTotal  |
      | YOUK1    | 2024-12-06 | 2024-12-06              |20                    | 10.50                 | true         | 0                         | 0                      | 1085.53|
      | YOUK2    | 2024-12-06 | 2024-12-07              |20                    | 10.50                 | false        | 0                         | 0                      | 256.53|
      | YOUK3    | 2024-12-06 | 2025-01-01              |20                    | 15.50                 | true         | 0                         | 0                      | 1218.88|
      | YOUK4    | 2024-12-06 | 2025-05-05              |20                    | 15.50                 | false        | 0                         | 0                      | 421.14|
      | YOUL1    | 2024-12-06 | 2024-12-06              |20                    | 10.50                 | true         | 0                         | 0                      | 1393.40|
      | YOUL2    | 2024-12-06 | 2024-12-07              |20                    | 10.50                 | false        | 0                         | 0                      | 524.99|
      | YOUL3    | 2024-12-06 | 2025-01-01              |20                    | 15.50                 | true         | 0                         | 0                      | 1740.53|
      | YOUL4    | 2024-12-06 | 2025-05-05              |20                    | 15.50                 | false        | 0                         | 0                      | 855.85|
      | YOUY1    | 2024-12-06 | 2024-12-06              |20                    | 10.50                 | true         | 0                         | 0                      | 1085.53|
      | YOUY2    | 2024-12-06 | 2024-12-07              |20                    | 10.50                 | false        | 0                         | 0                      | 256.53|
      | YOUY3    | 2024-12-06 | 2025-01-01              |20                    | 15.50                 | true         | 0                         | 0                      | 1393.40|
      | YOUY4    | 2024-12-06 | 2025-05-05              |20                    | 15.50                 | false        | 0                         | 0                      | 524.99|

    @mags_court_undesignated
    Examples: Mags Court Undesignated
      | feeCode  | startDate  | representationOrderDate | netTravelCosts| netWaitingCosts | netDisbursementAmount | disbursementVatAmount | vatIndicator | numberOfMediationSessions | boltOnAdjournedHearing | expectedTotal |
      | PROE1    | 2016-04-01 | 2016-04-01              | 100           | 50              | 20                    | 10.50                 | true         | 0                         | 0                      | 437.62|
      | PROE1    | 2022-09-30 | 2022-09-30              | 100           | 50              | 20                    | 10.50                 | false        | 0                         | 0                      | 397.88|
      | PROE2    | 2016-04-01 | 2016-04-01              | 100           | 50              | 20                    | 15.50                 | true         | 0                         | 0                      | 393.92|
      | PROE2    | 2022-09-30 | 2022-09-30              | 100           | 50              | 20                    | 15.50                 | false        | 0                         | 0                      | 356.01|
      | PROE3    | 2016-04-01 | 2016-04-01              | 100           | 50              | 20                    | 10.50                 | true         | 0                         | 0                      | 539.34|
      | PROF1    | 2022-09-30 | 2022-09-30              | 100           | 50              | 20                    | 10.50                 | false        | 0                         | 0                      | 648.15|
      | PROF2    | 2016-04-01 | 2022-09-29              | 100           | 50              | 20                    | 15.50                 | true         | 0                         | 0                      | 660.84|
      | PROF3    | 2016-04-01 | 2016-04-02              | 100           | 50              | 20                    | 15.50                 | false        | 0                         | 0                      | 814.94|
      | PROJ1    | 2016-04-01 | 2016-04-01              | 100           | 50              | 20                    | 10.50                 | true         | 0                         | 0                      | 437.62|
      | PROJ2    | 2016-04-01 | 2016-04-01              | 100           | 50              | 20                    | 10.50                 | false        | 0                         | 0                      | 332.27|
      | PROJ3    | 2022-09-30 | 2022-09-30              | 100           | 50              | 20                    | 15.50                 | true         | 0                         | 0                      | 772.98|
      | PROJ4    | 2022-09-30 | 2022-09-30              | 100           | 50              | 20                    | 15.50                 | false        | 0                         | 0                      | 611.81|
      | PROV1    | 2016-04-01 | 2016-04-01              | 100           | 50              | 20                    | 10.50                 | true         | 0                         | 0                      | 393.92|
      | PROV2    | 2022-09-30 | 2022-09-30              | 100           | 50              | 20                    | 10.50                 | false        | 0                         | 0                      | 611.81|
      | PROV3    | 2016-04-01 | 2016-04-01              | 100           | 50              | 20                    | 15.50                 | true         | 0                         | 0                      | 539.34|
      | PROV4    | 2022-09-30 | 2024-10-01              | 100           | 50              | 20                    | 15.50                 | false        | 0                         | 0                      | 911.08|

    @youth_court_undesignated
    Examples: Youth Court Undesignated
      | feeCode  | startDate  | representationOrderDate | netTravelCosts| netWaitingCosts | netDisbursementAmount | disbursementVatAmount | vatIndicator | numberOfMediationSessions | boltOnAdjournedHearing | expectedTotal |
      | YOUE1    | 2024-12-06 | 2024-12-06              | 100           | 50              | 20                    | 10.50                 | true         | 0                         | 0                      | 1190.96|
      | YOUE2    | 2024-12-06 | 2024-12-07              | 100           | 50              | 20                    | 10.50                 | false        | 0                         | 0                      | 356.01|
      | YOUE3    | 2024-12-06 | 2025-01-01              | 100           | 50              | 20                    | 15.50                 | true         | 0                         | 0                      | 1307.95|
      | YOUE4    | 2024-12-06 | 2025-05-05              | 100           | 50              | 20                    | 15.50                 | false        | 0                         | 0                      | 495.37|
      | YOUF1    | 2024-12-06 | 2024-12-06              | 100           | 50              | 20                    | 10.50                 | true         | 0                         | 0                      | 1491.29|
      | YOUF2    | 2024-12-06 | 2024-12-07              | 100           | 50              | 20                    | 10.50                 | false        | 0                         | 0                      | 611.81|
      | YOUF3    | 2024-12-06 | 2025-01-01              | 100           | 50              | 20                    | 15.50                 | true         | 0                         | 0                      | 1806.80|
      | YOUF4    | 2024-12-06 | 2025-05-05              | 100           | 50              | 20                    | 15.50                 | false        | 0                         | 0                      | 911.08|
      | YOUX1    | 2024-12-06 | 2024-12-06              | 100           | 50              | 20                    | 10.50                 | true         | 0                         | 0                      | 1190.96|
      | YOUX2    | 2024-12-06 | 2024-12-07              | 100           | 50              | 20                    | 10.50                 | false        | 0                         | 0                      | 356.01|
      | YOUX3    | 2024-12-06 | 2025-01-01              | 100           | 50              | 20                    | 15.50                 | true         | 0                         | 0                      | 1491.29|
      | YOUX4    | 2024-12-06 | 2025-05-05              | 100           | 50              | 20                    | 15.50                 | false        | 0                         | 0                      | 611.81|

    @assoc_civil_work
    Examples: Associated Civil Work
      | feeCode  | startDate  | uniqueFileNumber  | netTravelCosts| netWaitingCosts  | netDisbursementAmount | disbursementVatAmount | vatIndicator | numberOfMediationSessions | boltOnAdjournedHearing | expectedTotal |
      | ASMS     |            | 110516/001        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 118.80|
      | ASMS     | 2016-04-01 | 010416/002        | 0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 103.00|
      | ASPL     | 2016-04-01 | 110619/003        | 0             | 0                | 20                    | 15.50                 | true         | 0                         | 0                      | 334.80|
      | ASPL     | 2016-04-01 | 161224/004        | 0             | 0                | 20                    | 15.50                 | false        | 0                         | 0                      | 283.00|
      | ASAS     | 2016-04-01 | 200118/005        | 0             | 0                | 20                    | 15.50                 | true         | 0                         | 0                      | 212.40|
      | ASAS     | 2016-04-01 | 020416/006        | 0             | 0                | 20                    | 15.50                 | false        | 0                         | 0                      | 181.00|

    @family
    Examples: Family
      | feeCode  | startDate  | netProfitCosts | londonRate  | netTravelCosts| netWaitingCosts  | netDisbursementAmount | disbursementVatAmount | vatIndicator | numberOfMediationSessions | boltOnAdjournedHearing | expectedTotal |
      | FPB010   | 2013-04-01 | 396            | true        | 0             | 0                | 20                    | 2.00                 | true         | 0                         | 0                      | 180.40        |
      | FPB020   | 2013-04-01 | 1095           | false       | 0             | 0                | 20                    | 2.00                 | false        | 0                         | 0                      | 387.00        |
      | FPB030   | 2013-04-01 | 1491           | true        | 0             | 0                | 20                    | 2.00                 | true         | 0                         | 0                      | 618.40        |
      | FVP100   | 2013-04-01 | 438            | false       | 0             | 0                | 20                    | 2.00                 | false        | 0                         | 0                      | 168.00        |
      | FVP012   | 2013-04-01 |                | true        | 0             | 0                | 20                    | 2.00                 | true         | 0                         | 0                      | 125.20        |
      | FVP011   | 2013-04-01 | 258            | false       | 0             | 0                | 20                    | 2.00                 | false        | 0                         | 0                      | 108.00        |
      | FVP013   | 2013-04-01 | 258            | true        | 0             | 0                | 20                    | 2.00                 | true         | 0                         | 0                      | 125.20        |
      | FVP010   | 2013-04-01 |                | false       | 0             | 0                | 20                    | 2.00                 | false        | 0                         | 0                      | 108.00        |
      | FVP110   | 2013-04-01 | 690            | true        | 0             | 0                | 20                    | 2.00                 | true         | 0                         | 0                      | 463.60        |
      | FVP130   | 2013-04-01 | 597            | false       | 0             | 0                | 20                    | 2.00                 | false        | 0                         | 0                      | 221.00        |
      | FVP120   | 2013-04-01 | 723            | true        | 0             | 0                | 20                    | 2.00                 | true         | 0                         | 0                      | 485.20        |
      | FVP140   | 2013-04-01 | 624            | false       | 0             | 0                | 20                    | 2.00                 | false        | 0                         | 0                      | 230.00        |
      | FVP150   | 2013-04-01 | 1413           | true        | 0             | 0                | 20                    | 2.00                 | true         | 0                         | 0                      | 926.80        |
      | FVP180   | 2013-04-01 | 1221           | false       | 0             | 0                | 20                    | 2.00                 | false        | 0                         | 0                      | 429.00        |
      | FVP160   | 2013-04-01 | 1413           | true        | 0             | 0                | 20                    | 2.00                 | true         | 0                         | 0                      | 752.80        |
      | FVP170   | 2013-04-01 | 1221           | false       | 0             | 0                | 20                    | 2.00                 | false        | 0                         | 0                      | 554.00        |
      | FVP190   | 2013-04-01 |                | true        | 0             | 0                | 20                    | 2.00                 | true         | 0                         | 0                      | 202.00        |
      | FVP200   | 2013-04-01 |                | false       | 0             | 0                | 20                    | 2.00                 | false        | 0                         | 0                      | 222.00        |
      | FVP210   | 2013-04-01 |                | true        | 0             | 0                | 20                    | 2.00                 | true         | 0                         | 0                      | 442.00        |
      | FVP020   | 2013-04-01 | 855            | false       | 0             | 0                | 20                    | 2.00                 | false        | 0                         | 0                      | 426.00        |
      | FVP040   | 2013-04-01 | 948            | true        | 0             | 0                | 20                    | 2.00                 | true         | 0                         | 0                      | 401.20        |
      | FVP030   | 2013-04-01 | 882            | false       | 0             | 0                | 20                    | 2.00                 | false        | 0                         | 0                      | 441.00        |
      | FVP050   | 2013-04-01 | 981            | true        | 0             | 0                | 20                    | 2.00                 | true         | 0                         | 0                      | 414.40        |
      | FVP060   | 2013-04-01 | 1479           | false       | 0             | 0                | 20                    | 2.00                 | false        | 0                         | 0                      | 759.00        |
      | FVP090   | 2013-04-01 | 1671           | true        | 0             | 0                | 20                    | 2.00                 | true         | 0                         | 0                      | 690.40        |
      | FVP070   | 2013-04-01 | 1479           | false       | 0             | 0                | 20                    | 2.00                 | false        | 0                         | 0                      | 634.00        |
      | FVP080   | 2013-04-01 | 1671           | true        | 0             | 0                | 20                    | 2.00                 | true         | 0                         | 0                      | 864.40        |
      | FVP021   | 2013-04-01 | 855            | false       | 0             | 0                | 20                    | 2.00                 | false        | 0                         | 0                      | 426.00        |
      | FVP041   | 2013-04-01 | 948            | true        | 0             | 0                | 20                    | 2.00                 | true         | 0                         | 0                      | 401.20        |
      | FVP031   | 2013-04-01 | 882            | false       | 0             | 0                | 20                    | 2.00                 | false        | 0                         | 0                      | 441.00        |
      | FVP051   | 2013-04-01 | 981            | true        | 0             | 0                | 20                    | 2.00                 | true         | 0                         | 0                      | 414.40        |
      | FVP061   | 2013-04-01 | 1479           | false       | 0             | 0                | 20                    | 2.00                 | false        | 0                         | 0                      | 759.00        |
      | FVP091   | 2013-04-01 | 1671           | true        | 0             | 0                | 20                    | 2.00                 | true         | 0                         | 0                      | 690.40        |
      | FVP071   | 2013-04-01 | 1479           | false       | 0             | 0                | 20                    | 2.00                 | false        | 0                         | 0                      | 634.00        |
      | FVP081   | 2013-04-01 | 1671           | true        | 0             | 0                | 20                    | 2.00                 | true         | 0                         | 0                      | 864.40        |

    @prison_law
    Examples: Prison Law
      | feeCode  | startDate  | uniqueFileNumber  | netTravelCosts| netWaitingCosts  | netDisbursementAmount | disbursementVatAmount | vatIndicator | numberOfMediationSessions | boltOnAdjournedHearing | expectedTotal | representationOrderDate |
      | PRIA     | 2016-04-01 | 110516/001        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 264.90| 2016-05-12              |
      | PRIB1    | 2016-04-01 | 010416/002        | 0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 227.93|                         |
      | PRIB2    | 2016-04-01 | 110619/003        | 0             | 0                | 20                    | 15.50                 | true         | 0                         | 0                      | 700.99|                         |
      | PRIC1    | 2016-04-01 | 161224/004        | 0             | 0                | 20                    | 15.50                 | false        | 0                         | 0                      | 461.21|                         |
      | PRIC2    | 2016-04-01 | 200118/005        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 1769.33| 2018-05-12              |
      | PRID1    | 2016-04-01 | 020416/006        | 0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 227.93|                         |
      | PRID2    | 2016-04-01 | 110516/001        | 0             | 0                | 20                    | 15.50                 | true         | 0                         | 0                      | 700.99|                         |
      | PRIE1    | 2016-04-01 | 010416/002        | 0             | 0                | 20                    | 15.50                 | false        | 0                         | 0                      | 461.21|                         |
      | PRIE2    | 2016-04-01 | 020416/003        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 1769.33|                         |

    @appeals_and_reviews
    Examples: Appeals and Reviews
      | feeCode | startDate   | uniqueFileNumber | representationOrderDate  | netProfitCosts | netTravelCosts | netWaitingCosts  | vatIndicator | netDisbursementAmount  | disbursementVatAmount  | expectedTotal  |
      | PROH    | 2022-09-30  | 110516/001       | 2022-10-01               | 1503.56        | 20.5           | 30               | Yes          | 20                     | 10.5                   | 1888.87|
      | PROH    | 2016-04-01  | 110516/002       |                          | 600            | 10             | 30               | No           | 20                     | 10.5                   | 664.00|
      | APPA    | 2016-04-01  | 121019/003       |                          | 40             | 10             | 30               | Yes          | 20                     | 15.5                   | 120.00|
      | APPA    | 2022-09-30  | 121022/004       |                          | 50             | 10             | 30               | No           | 20                     | 15.5                   | 114.00|
      | APPB    | 2022-09-30  | 131224/005       |                          | 90             | 10             | 30               | Yes          | 20                     | 10.5                   | 180.00|
      | APPB    | 2016-04-01  | 020416/006       |                          | 40             | 10             | 30               | No           | 20                     | 10.5                   | 104.00|


    @immigration_and_asylum_fixed_fee
    Examples: Immigration and Asylum Fixed Fee
      | feeCode | startDate  | immigrationPriorAuthorityNumber| detentionTravelAndWaitingCosts | jrFormFilling | boltOnHomeOfficeInterview | boltOnAdjournedHearing | boltOnCmrhOral | boltOnCmrhTelephone  | boltOnSubstantiveHearing | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal |
      | IACA    | 2013-04-01 |                                | 50                             | 100           |                           |                        | 4              | 5                    |                          | Yes          | 20                    | 4.0                   | 1813.20       |
      | IACA    | 2020-06-08 | 111                            | 50                             | 100           |                           |                        | 9              | 1                    |                          | No           | 601                   | 10.5                  | 2572.50       |
      | IACA    | 2023-03-31 |                                | 50                             | 100           |                           |                        | 2              | 4                    |                          | Yes          | 599                   | 15.5                  | 1897.30       |
      | IACB    | 2013-04-01 |                                | 50                             | 100           |                           | 3                      | 6              | 8                    |                          | No           | 20                    | 4.0                   | 3242.00       |
      | IACB    | 2020-06-08 |                                | 50                             | 100           |                           | 1                      | 2              | 3                    |                          | Yes          | 599                   | 10.5                  | 2747.90       |
      | IACB    | 2023-03-31 |                                | 50                             | 100           |                           | 4                      | 4              | 7                    |                          | No           | 599                   | 10.5                  | 3566.50       |
      | IACC    | 2020-06-08 |                                | 50                             | 100           |                           | 4                      | 3              | 2                    |                          | Yes          | 20                    | 4.0                   | 2905.20       |
      | IACC    | 2023-03-31 | 111                            | 50                             | 100           |                           | 5                      | 6              | 7                    |                          | No           | 601                   | 15.5                  | 4126.50       |
      | IACC    | 2021-01-01 |                                | 50                             | 100           |                           | 3                      | 7              | 4                    |                          | Yes          | 599                   | 10.5                  | 4310.30       |
      | IACE    | 2023-04-01 |                                | 50                             | 100           |                           |                        | 1              | 2                    |                          | No           | 20                    | 4.0                   | 1189.00       |
      | IACE    | 2023-04-02 |                                | 50                             | 100           |                           |                        | 4              | 3                    |                          | Yes          | 599                   | 15.5                  | 2718.10       |
      | IACE    | 2025-04-02 |                                | 50                             | 100           |                           |                        | 5              | 6                    |                          | No           | 599                   | 15.5                  | 2803.50       |
      | IACF    | 2023-04-01 | 111                            | 50                             | 100           |                           | 7                      | 6              | 5                    |                          | Yes          | 601                   | 10.5                  | 5452.30       |
      | IACF    | 2023-04-02 |                                | 50                             | 100           |                           | 8                      | 9              | 1                    |                          | No           | 599                   | 10.5                  | 4942.50       |
      | IACF    | 2025-04-02 |                                | 50                             | 100           |                           | 2                      | 3              | 4                    |                          | Yes          | 599                   | 15.5                  | 3783.70       |
      | IALB    | 2013-04-01 |                                | 50                             | 100           | 1                         |                        |                |                      |                          | No           | 20                    | 4.0                   | 853.00        |
      | IALB    | 2020-06-08 | 111                            | 50                             | 100           | 2                         |                        |                |                      |                          | Yes          | 401                   | 10.5                  | 1725.50       |
      | IALB    | 2023-04-01 |                                | 50                             | 100           | 3                         |                        |                |                      |                          | No           | 399                   | 10.5                  | 1770.50       |
      | IMCA    | 2013-04-01 |                                | 50                             | 100           |                           |                        | 4              | 4                    |                          | Yes          | 20                    | 4.0                   | 1705.20       |
      | IMCA    | 2020-06-08 | 111                            | 50                             | 100           |                           |                        | 5              | 6                    |                          | No           | 601                   | 15.5                  | 2363.50       |
      | IMCA    | 2023-03-31 |                                | 50                             | 100           |                           |                        | 7              | 8                    |                          | Yes          | 599                   | 10.5                  | 3320.30       |
      | IMCB    | 2013-04-01 |                                | 50                             | 100           |                           | 1                      | 9              | 9                    |                          | No           | 20                    | 4.0                   | 3330.00       |
      | IMCB    | 2020-06-08 |                                | 50                             | 100           |                           | 2                      | 8              | 1                    |                          | Yes          | 599                   | 15.5                  | 3711.70       |
      | IMCB    | 2023-03-31 |                                | 50                             | 100           |                           | 3                      | 8              | 2                    |                          | No           | 599                   | 15.5                  | 3446.50       |
      | IMCC    | 2020-06-08 |                                | 50                             | 100           |                           | 4                      | 8              | 3                    |                          | Yes          | 20                    | 4.0                   | 3811.20       |
      | IMCC    | 2023-03-31 | 111                            | 50                             | 100           |                           | 5                      | 8              | 4                    |                          | No           | 601                   | 10.5                  | 4018.50       |
      | IMCC    | 2021-01-01 |                                | 50                             | 100           |                           | 6                      | 7              | 5                    |                          | Yes          | 599                   | 15.5                  | 4804.90       |
      | IMCE    | 2023-04-01 |                                | 50                             | 100           |                           |                        | 6              | 6                    |                          | No           | 20                    | 4.0                   | 2338.00       |
      | IMCE    | 2023-04-02 |                                | 50                             | 100           |                           |                        | 5              | 7                    |                          | Yes          | 599                   | 10.5                  | 3295.10       |
      | IMCE    | 2025-04-02 |                                | 50                             | 100           |                           |                        | 4              | 8                    |                          | No           | 599                   | 10.5                  | 2771.50       |
      | IMCF    | 2023-04-01 |                                | 50                             | 100           |                           | 7                      | 3              | 9                    |                          | Yes          | 20                    | 4.0                   | 4436.40       |
      | IMCF    | 2023-04-02 | 111                            | 50                             | 100           |                           | 8                      | 2              | 7                    |                          | No           | 601                   | 15.5                  | 4108.50       |
      | IMCF    | 2025-04-02 |                                | 50                             | 100           |                           | 9                      | 1              | 5                    |                          | Yes          | 599                   | 10.5                  | 4577.90       |
      | IMLB    | 2013-04-01 |                                | 50                             | 100           | 1                         |                        |                |                      |                          | No           | 20                    | 4.0                   | 674.00        |
      | IMLB    | 2020-06-08 | 111                            | 50                             | 100           | 2                         |                        |                |                      |                          | Yes          | 401                   | 15.5                  | 1515.70       |
      | IMLB    | 2023-04-01 |                                | 50                             | 100           | 3                         |                        |                |                      |                          | No           | 399                   | 15.5                  | 1596.50       |
      | IDAS1   | 2013-04-01 |                                | 50                             | 100           |                           |                        |                |                      |                          | Yes          | 20                    | 4.0                   | 420.00        |
      | IDAS1   | 2020-06-08 |                                | 50                             | 100           |                           |                        |                |                      |                          | No           | 20                    | 4.0                   | 354.00        |
      | IDAS1   | 2023-04-01 |                                | 50                             | 100           |                           |                        |                |                      |                          | Yes          | 20                    | 4.0                   | 420.00        |
      | IDAS2   | 2013-04-01 |                                | 50                             | 100           |                           |                        |                |                      |                          | No           | 20                    | 4.0                   | 534.00        |
      | IDAS2   | 2020-06-08 |                                | 50                             | 100           |                           |                        |                |                      |                          | Yes          | 20                    | 4.0                   | 636.00        |
      | IDAS2   | 2023-04-01 |                                | 50                             | 100           |                           |                        |                |                      |                          | No           | 20                    | 4.0                   | 534.00        |


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
      | IA100   | 2013-04-01 | 99             |                                  | Yes          |                       | 10.5                  | 118.80        |
      | IA100   | 2013-04-02 | 100            |                                  | No           |                       | 10.5                  | 100.00        |

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
      | PROW     | 2020-10-19 | 110516/001        | 2020-10-19              |0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 241.68|
      | PROW     | 2020-10-19 | 110516/002        | 2021-10-19              |0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 205.40|
      | PROW     | 2020-10-19 | 121019/003        | 2022-09-29              |0             | 0                | 20                    | 15.50                 | true         | 0                         | 0                      | 241.68|
      | PROW     | 2022-09-30 | 121022/004        | 2022-09-30              |0             | 0                | 20                    | 15.50                 | false        | 0                         | 0                      | 232.61|
      | PROW     | 2022-09-30 | 131224/005        | 2023-09-30              |0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 274.33|
      | PROW     | 2022-09-30 | 020416/006        | 2025-01-01              |0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 232.61|

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
      | PROD    | 2020-10-19        | 010416/001       | 2020-10-19              | 1000           | 800            | 8000            | Yes          | 20                    | 10.5                  | 11784.00|
      | PROD    | 2020-10-19        | 300922/002       | 2021-10-19              | 60000          |                | 0               | No           | 20                    | 10.5                  | 60024.00|
      | PROD    | 2020-10-19        | 290922/003       | 2022-09-29              | 200            | 5000           | 600             | Yes          | 20                    | 15.5                  | 6984.00|
      | PROD    | 2022-09-30        |                  |                         | 3209.54        | 499            | 323             | No           | 20                    | 15.5                  | 4055.54|
      | PROD    | 2022-09-30        | 300922/005       |                         | 1200           | 566            | 788             | Yes          | 20                    | 10.5                  | 3088.80|
      | PROD    | 2022-09-30        |                  |                         | 1600           | 40000          | 80000           | No           | 20                    | 10.5                  | 121624.00|


    @pre_order_cover
    Examples: Pre Order Cover
      | feeCode | startDate  | uniqueFileNumber | netProfitCosts | netTravelCosts | netWaitingCosts | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal | representationOrderDate |
      | PROP1   | 2016-04-01 | 110516/001       | 5              | 10             | 2               | Yes          | 20                    | 10.5                  | 44.40| 2016-04-02              |
      | PROP1   | 2022-09-30 | 290922/002       | 10             | 0              | 3               | No           | 20                    | 10.5                  | 37.00|                         |
      | PROP1   | 2022-09-30 | 161223/003       | 3              | 2              | 0               | Yes          | 20                    | 15.5                  | 30.00|                         |
      | PROP2   | 2016-04-01 | 020416/004       | 5              | 10             | 2               | No           | 20                    | 15.5                  | 41.00|                         |
      | PROP2   | 2022-09-30 | 290922/005       | 10             | 0              | 3               | Yes          | 20                    | 10.5                  | 39.60|                         |
      | PROP2   | 2022-09-30 | 161224/006       | 3              | 2              | 0               | No           | 20                    | 10.5                  | 29.00|                         |
