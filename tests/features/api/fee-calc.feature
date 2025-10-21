Feature: Fee Calculation API

  @api
  Scenario Outline: Calculate fee total for a given payload
    Given I have an initialized API client
    And a fee calculation payload with:
      | feeCode                   | <feeCode>                   |
      | startDate                 | <startDate>                 |
      | netDisbursementAmount     | <netDisbursementAmount>     |
      | disbursementVatAmount     | <disbursementVatAmount>     |
      | vatIndicator              | <vatIndicator>              |
      | numberOfMediationSessions | <numberOfMediationSessions> |
      | boltOnAdjournedHearing    | <boltOnAdjournedHearing>    |
      | netProfitCosts            | <netProfitCosts>            |
      | netCostOfCounsel          | <netCostOfCounsel>          |
      | travelAndWaitingCosts     | <travelAndWaitingCosts>     |
      | uniqueFileNumber          | <uniqueFileNumber>          |
      | policeStationId           | <policeStationId>           |
      | policeStationSchemeId     | <policeStationSchemeId>     |
      | representationOrderDate   | <representationOrderDate>   |
      | netTravelCosts            | <netTravelCosts>            |
      | netWaitingCosts           | <netWaitingCosts>           |
      | londonRate                | <londonRate>                |
    When I POST "/api/v1/fee-calculation" with the payload
    Then the response status should be 200
    And the JSON path "feeCalculation.totalAmount" should equal number <expectedTotal>

    @other_civil
    Examples: Other Civil
      | feeCode | startDate  | netDisbursementAmount | disbursementVatAmount | vatIndicator | numberOfMediationSessions | boltOnAdjournedHearing | expectedTotal |
      | COM     | 2013-06-08 | 50.5                  | 20.15                 | true         | 0                         | 0                      | 389.85        |
      | COM     | 2013-06-08 | 50.5                  | 20.15                 | false        | 0                         | 0                      | 336.65        |
      | CAPA    | 2013-06-09 | 88.12                 | 10.13                 | true         | 0                         | 0                      | 385.05        |
      | CLIN    | 2013-06-10 | 90.14                 | 12.06                 | false        | 0                         | 0                      | 297.20        |
      | DEBT    | 2013-06-11 | 92.16                 | 13.99                 | true         | 0                         | 0                      | 322.15        |
      | ELA     | 2025-06-14 | 94.18                 | 15.92                 | false        | 0                         | 0                      | 267.10        |
      | HOUS    | 2013-06-14 | 96.20                 | 17.85                 | true         | 0                         | 0                      | 302.45        |
      | MISCGEN | 2013-06-15 | 98.22                 | 19.78                 | false        | 0                         | 0                      | 197.00        |
      | MISCCON | 2015-06-16 | 100.24                | 21.71                 | true         | 0                         | 0                      | 312.75        |
      | MISCASBI| 2015-06-17 | 102.26                | 23.64                 | false        | 0                         | 0                      | 282.90        |
      | MISCPI  | 2015-06-18 | 104.28                | 25.57                 | true         | 0                         | 0                      | 373.45        |
      | MISCEMP | 2013-06-19 | 106.30                | 27.50                 | false        | 0                         | 0                      | 340.80        |
      | PUB     | 2013-06-20 | 108.32                | 29.43                 | true         | 0                         | 0                      | 448.55        |
      
      @mediation
      Examples: Mediation 
      | feeCode | startDate  | netDisbursementAmount | disbursementVatAmount | vatIndicator | numberOfMediationSessions | boltOnAdjournedHearing | expectedTotal |
      | ASSS    | 2013-06-07 | 50.5                  | 20.15                 | true         | 0                         | 0                      | 175.05        |
      | ASST    | 2025-08-07 | 999                   | 200                   | false        | 0                         | 0                      | 1329.00       |
      | MDAS2B  | 2016-08-08 | 50.5                  | 20.15                 | true         | 1                         | 0                      | 272.25        |
      | MDPC1B  | 2017-08-09 | 650                   | 17.62                 | false        | 2                         | 0                      | 1199.62       |
      | MDCS1S  | 2018-08-10 | 230                   | 647                   | true         | 2                         | 0                      | 1330.60       |
      | MDCC1S  | 2019-08-11 | 100                   | 20                    | false        | 1                         | 0                      | 413.00        |
      | MDCS1S  | 2018-08-10 | 100                   | 20                    | true         | 2                         | 0                      | 573.60        |
    
    @mental_health
    Examples: Mental Health
      | feeCode | startDate  | netDisbursementAmount | disbursementVatAmount | vatIndicator | numberOfMediationSessions | boltOnAdjournedHearing | expectedTotal |
      | MHL01   | 2013-06-19 | 106.6                 | 12.23                 | true         | 0                         | 0                      | 434.43        |
      | MHL02   | 2013-06-20 | 170.8                 | 99.6                  | true         | 0                         | 2                      | 706.00        |
      | MHL03   | 2013-06-21 | 202.15                | 18.99                 | false        | 0                         | 3                      | 1022.14       |
      | MHL10   | 2013-06-22 | 1111.89               | 20.11                 | false        | 0                         | 0                      | 1261.00       |

    @discrimination
    Examples:
      | feeCode | startDate  | netProfitCosts | netCostOfCounsel | travelAndWaitingCosts | netDisbursementAmount | disbursementVatAmount | vatIndicator | expectedTotal|
      | DISC    | 2013-06-15 | 100.16         | 200.18           | 999.12                | 100                   | 20                    | true         | 960          |
      | DISC    | 2013-06-16 | 30.23          | 12.34            | 10.12                 | 100                   | 20                    | false        | 172.69       |
      | DISC    | 2013-06-17 | 0              | 20               | 0                     | 100                   | 20                    | true         | 144          |
      | DISC    | 2013-06-18 | 0              | 0                | 0                     | 100                   | 20                    | false        | 120          |
      | DISC    | 2013-06-19 | 159            | 0                | 800                   | 100                   | 20                    | true         | 960          |
      | DISC    | 2013-06-20 | 0              | 200              |                       | 100                   | 20                    | true         | 360          |
      | DISC    | 2013-06-21 | 10             | 20               | 699                   | 100                   | 20                    | true         | 960          |

    @welfare_benefits
    Examples: Welfare Benefits
      | feeCode | startDate  | netDisbursementAmount | disbursementVatAmount | vatIndicator | numberOfMediationSessions | boltOnAdjournedHearing | expectedTotal |
      | WFB1    | 2023-04-01 | 20                    | 10.50                 | true         | 0                         | 0                      | 280.10        |
      | WFB1    | 2023-04-01 | 20                    | 10.50                 | false        | 0                         | 0                      | 238.50        |
      | WFB1    | 2025-05-01 | 20                    | 15.50                 | true         | 0                         | 0                      | 285.10        |
      | WFB1    | 2025-05-01 | 20                    | 15.50                 | false        | 0                         | 0                      | 243.50        |

    @police_station_work
    Examples: Police Station Work
      | feeCode  | startDate  | uniqueFileNumber  | policeStationId | policeStationSchemeId  | netDisbursementAmount | disbursementVatAmount | vatIndicator | numberOfMediationSessions | boltOnAdjournedHearing | expectedTotal |
      | INVC     | 2016-04-01 | 110516/001        | NE001           | 1001                   | 20                    | 10.50                 | true         | 0                         | 0                      | 188.18        |
      | INVC     | 2016-04-01 | 110516/002        | NE003           | 1001                   | 20                    | 10.50                 | false        | 0                         | 0                      | 166.46        |
      | INVC     | 2022-09-30 | 121022/003        | NE016           | 1004                   | 20                    | 15.50                 | true         | 0                         | 0                      | 245.80        |
      | INVC     | 2022-09-30 | 121022/004        | NE041           | 1010                   | 20                    | 15.50                 | false        | 0                         | 0                      | 199.84        |
      | INVC     | 2024-12-06 | 131224/005        | RD052           | 1141                   | 20                    | 15.50                 | true         | 0                         | 0                      | 323.86        |
      | INVC     | 2024-12-06 | 131224/006        | RD091           | 1142                   | 20                    | 15.50                 | false        | 0                         | 0                      | 259.02        |


    @education
    Examples: Education
      | feeCode   | startDate  | netDisbursementAmount | disbursementVatAmount | vatIndicator | numberOfMediationSessions | boltOnAdjournedHearing | expectedTotal |
      | EDUFIN    | 2013-04-01 | 20                    | 10.50                 | true         | 0                         | 0                      | 356.90        |
      | EDUFIN    | 2013-04-01 | 20                    | 10.50                 | false        | 0                         | 0                      | 302.50        |
      | EDUFIN    | 2013-04-01 | 20                    | 15.50                 | true         | 0                         | 0                      | 361.90        |
      | EDUFIN    | 2013-04-01 | 20                    | 15.50                 | false        | 0                         | 0                      | 307.50        |

    @mags_court_designated
    Examples: Mags Court Designated
      | feeCode | startDate   | representationOrderDate |netDisbursementAmount | disbursementVatAmount | vatIndicator | numberOfMediationSessions | boltOnAdjournedHearing | expectedTotal |
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
      | YOUK2    | 2024-12-06 | 2024-07-12              |20                    | 10.50                 | false        | 0                         | 0                      | 263.03         |
      | YOUK3    | 2024-12-06 | 2025-01-01              |20                    | 15.50                 | true         | 0                         | 0                      | 1230.38        |
      | YOUK4    | 2024-12-06 | 2025-05-05              |20                    | 15.50                 | false        | 0                         | 0                      | 432.64         |
      | YOUL1    | 2024-12-06 | 2024-12-06              |20                    | 10.50                 | true         | 0                         | 0                      | 1399.90        |
      | YOUL2    | 2024-12-06 | 2014-12-07              |20                    | 10.50                 | false        | 0                         | 0                      | 531.49         |
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
      | ASMS     | 2016-04-01 | 110516/001        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 125.30        |
      | ASMS     | 2016-04-01 | 010416/002        | 0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 109.50        |
      | ASPL     | 2016-04-01 | 110619/003        | 0             | 0                | 20                    | 15.50                 | true         | 0                         | 0                      | 346.30        |
      | ASPL     | 2016-04-01 | 161224/004        | 0             | 0                | 20                    | 15.50                 | false        | 0                         | 0                      | 294.50        |
      | ASAS     | 2016-04-01 | 200118/005        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 223.90        |
      | ASAS     | 2016-04-01 | 020416/006        | 0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 192.50        |

    @family
    Examples: Family
      | feeCode  | startDate  | londonRate  | netTravelCosts| netWaitingCosts  | netDisbursementAmount | disbursementVatAmount | vatIndicator | numberOfMediationSessions | boltOnAdjournedHearing | expectedTotal |
      | FPB010   | 2011-10-03 | true        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 188.90        |
      | FPB020   | 2011-10-03 | false       | 0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 395.50        |
      | FPB030   | 2011-10-03 | true        | 0             | 0                | 20                    | 15.50                 | true         | 0                         | 0                      | 631.90        |
      | FVP100   | 2011-10-03 | false       | 0             | 0                | 20                    | 15.50                 | false        | 0                         | 0                      | 181.50        |
      | FVP012   | 2011-10-03 | true        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 133.70        |
      | FVP011   | 2011-10-03 | false       | 0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 116.50        |
      | FVP013   | 2011-10-03 | true        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 133.70        |
      | FVP010   | 2011-10-03 | false       | 0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 116.50        |
      | FVP110   | 2011-10-03 | true        | 0             | 0                | 20                    | 15.50                 | true         | 0                         | 0                      | 477.10        |
      | FVP130   | 2011-10-03 | false       | 0             | 0                | 20                    | 15.50                 | false        | 0                         | 0                      | 234.50        |
      | FVP120   | 2011-10-03 | true        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 493.70        |
      | FVP140   | 2011-10-03 | false       | 0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 238.50        |
      | FVP150   | 2011-10-03 | true        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 935.30        |
      | FVP180   | 2011-10-03 | false       | 0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 437.50        |
      | FVP160   | 2011-10-03 | true        | 0             | 0                | 20                    | 15.50                 | true         | 0                         | 0                      | 766.30        |
      | FVP170   | 2011-10-03 | false       | 0             | 0                | 20                    | 15.50                 | false        | 0                         | 0                      | 567.50        |
      | FVP190   | 2011-10-03 | true        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 210.50        |
      | FVP200   | 2011-10-03 | false       | 0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 230.50        |
      | FVP210   | 2011-10-03 | true        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 450.50        |
      | FVP020   | 2011-10-03 | false       | 0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 434.50        |
      | FVP040   | 2011-10-03 | true        | 0             | 0                | 20                    | 15.50                 | true         | 0                         | 0                      | 414.70        |
      | FVP030   | 2011-10-03 | false       | 0             | 0                | 20                    | 15.50                 | false        | 0                         | 0                      | 454.50        |
      | FVP050   | 2011-10-03 | true        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 422.90        |
      | FVP060   | 2011-10-03 | false       | 0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 767.50        |
      | FVP090   | 2011-10-03 | true        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 698.90        |
      | FVP070   | 2011-10-03 | false       | 0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 642.50        |
      | FVP080   | 2011-10-03 | true        | 0             | 0                | 20                    | 15.50                 | true         | 0                         | 0                      | 877.90        |
      | FVP021   | 2011-10-03 | false       | 0             | 0                | 20                    | 15.50                 | false        | 0                         | 0                      | 439.50        |
      | FVP041   | 2011-10-03 | true        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 409.70        |
      | FVP031   | 2011-10-03 | false       | 0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 449.50        |
      | FVP051   | 2011-10-03 | true        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 422.90        |
      | FVP061   | 2011-10-03 | false       | 0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 767.50        |
      | FVP091   | 2011-10-03 | true        | 0             | 0                | 20                    | 15.50                 | true         | 0                         | 0                      | 703.90        |
      | FVP071   | 2011-10-03 | false       | 0             | 0                | 20                    | 15.50                 | false        | 0                         | 0                      | 647.50        |
      | FVP081   | 2011-10-03 | true        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 872.90        |

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