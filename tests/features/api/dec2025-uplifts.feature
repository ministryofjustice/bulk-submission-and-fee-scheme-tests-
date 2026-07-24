Feature: Fee Calculations for Dec 2025 uplifts

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

    @dec2025_other_civil
    Examples: Other Civil
      | feeCode   | startDate  | netProfitCosts | netCostOfCounsel | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal |
      | HOUS      | 2025-12-22 |                |                  | Yes          | 20                    | 2.00                  | 289.60        |
      | ELA       | 2025-12-22 |                |                  | No           | 20                    | 2.00                  | 245.00        |
      | DEBT      | 2025-12-22 |                |                  | No           | 20                    | 2.00                  | 278.00        |

    @dec2025_sending_hearing
    Examples: CL Sending Hearing FF
      | feeCode  | startDate  | uniqueFileNumber  | representationOrderDate |netTravelCosts| netWaitingCosts  | netDisbursementAmount | disbursementVatAmount | vatIndicator | numberOfMediationSessions | boltOnAdjournedHearing | expectedTotal |
      | PROW     | 2020-10-19 | 110516/001        | 2025-12-22              |0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 299.36|

    @dec2025_prison_law
    Examples: Prison Law
      | feeCode  | startDate  | uniqueFileNumber  | netTravelCosts| netWaitingCosts  | netDisbursementAmount | disbursementVatAmount | vatIndicator | numberOfMediationSessions | boltOnAdjournedHearing | expectedTotal |
      | PRIA     | 2016-04-01 | 221225/001        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 322.72|
      | PRIB1    | 2016-04-01 | 221225/002        | 0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 276.87|
      | PRIB2    | 2016-04-01 | 221225/003        | 0             | 0                | 20                    | 15.50                 | true         | 0                         | 0                      | 863.47|
      | PRIC1    | 2016-04-01 | 221225/004        | 0             | 0                | 20                    | 15.50                 | false        | 0                         | 0                      | 566.14|
      | PRIC2    | 2016-04-01 | 221225/005        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 2188.21|
      | PRID1    | 2016-04-01 | 221225/006        | 0             | 0                | 20                    | 10.50                 | false        | 0                         | 0                      | 276.87|
      | PRID2    | 2016-04-01 | 221225/001        | 0             | 0                | 20                    | 15.50                 | true         | 0                         | 0                      | 863.47|
      | PRIE1    | 2016-04-01 | 221225/002        | 0             | 0                | 20                    | 15.50                 | false        | 0                         | 0                      | 566.14|
      | PRIE2    | 2016-04-01 | 221225/003        | 0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 2188.21|

    @dec2025_pre_order_cover
    Examples: Pre Order Cover
      | feeCode | startDate  | uniqueFileNumber | netProfitCosts | netTravelCosts | netWaitingCosts | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal |
      | PROP1   | 2016-04-01 | 221225/001       | 28.65          | 10             | 2               | Yes          | 20                    | 10.5                  | 72.78|
      | PROP2   | 2016-04-01 | 221225/004       | 25.37          | 10             | 2               | No           | 20                    | 15.5                  | 61.37|

    @dec2025_early_cover_refused_means
    Examples: Early Cover or Refused Means Test
      | feeCode  | startDate  | uniqueFileNumber  | representationOrderDate |netTravelCosts| netWaitingCosts  | netDisbursementAmount | disbursementVatAmount | vatIndicator | numberOfMediationSessions | boltOnAdjournedHearing | expectedTotal |
      | PROT     | 2016-04-01 | 221225/001        |                         |0             | 0                | 20                    | 10.50                 | true         | 0                         | 0                      | 103.90        |
      | PROU     | 2016-04-01 | 221225/004        |                         |0             | 0                | 20                    | 15.50                 | false        | 0                         | 0                      | 28.85         |

    @dec2025_appeals_and_reviews
    Examples: Appeals and Reviews
      | feeCode | startDate  | uniqueFileNumber | representationOrderDate | netProfitCosts | netTravelCosts | netWaitingCosts | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal |
      | PROH1   | 2016-04-01 | 221225/001       |                         | 1660.97        | 20.5           | 30              | Yes          | 20                    | 10.5                  | 2077.76|
      | PROH2   | 2016-04-01 | 221225/001       |                         | 1514.06        | 10             | 30              | No           | 20                    | 10.5                  | 1578.06|
      | APPA    | 2022-09-30 | 221225/001       |                         | 286.29         | 10             | 30              | No           | 20                    | 15.5                  | 350.29|
      | APPB    | 2022-09-30 | 221225/001       |                         | 517.16         | 10             | 30              | Yes          | 20                    | 10.5                  | 692.59|

    @dec2025_immigration_and_asylum_hourly_rate_LH
    Examples: Immigration and Asylum Hourly Rate Legal Help
      | feeCode | startDate  | netProfitCosts | immigrationPriorAuthorityNumber  | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal |
      | IAXL    | 2025-12-22 | 1099.99        |                                  | Yes          | 399                   | 10.5                  | 1729.49       |
      | IMXL    | 2025-12-22 | 699.99         |                                  | Yes          | 399                   | 10.5                  | 1249.49       |
      | IA100   | 2025-12-22 | 150            |                                  | Yes          |                       | 10.5                  | 180.00        |

    @dec2025_immigration_and_asylum_hourly_rate_CLR
    Examples: Immigration and Asylum Hourly Rate CLR
      | feeCode | startDate  | netProfitCosts | immigrationPriorAuthorityNumber | netCostOfCounsel  | detentionTravelAndWaitingCosts | jrFormFilling | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal |
      | IAXC    | 2025-12-22 | 1100           |                                  | 500              | 50                             | 100           | Yes          | 600                   | 10.5                  | 2530.50       |
      | IMXC    | 2025-12-22 | 900            |                                  | 400              | 50                             | 100           | No           | 399                   | 15.5                  | 1714.50       |

    @dec2025_immigration_and_asylum_fixed_fee
    Examples: Immigration and Asylum Fixed Fee
      | feeCode | startDate   | immigrationPriorAuthorityNumber| detentionTravelAndWaitingCosts | jrFormFilling | boltOnHomeOfficeInterview | boltOnAdjournedHearing | boltOnCmrhOral | boltOnCmrhTelephone  | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal |
      | IACE    | 2025-12-22  |                                | 50                             | 100           |                           |                        | 4              | 3                    | Yes          | 599                   | 15.5                  | 2998.90       |
      | IACF    | 2025-12-22  |                                | 50                             | 100           |                           | 8                      | 9              | 1                    | No           | 599                   | 10.5                  | 5472.50       |
      | IALB    | 2025-12-22  |                                | 50                             | 100           | 1                         |                        |                |                      | No           | 20                    | 4.0                   | 1093.00       |
      | IMCE    | 2025-12-22  |                                | 50                             | 100           |                           |                        | 5              | 7                    | Yes          | 599                   | 10.5                  | 3629.90       |
      | IMCF    | 2025-12-22  |                                | 50                             | 100           |                           | 7                      | 3              | 9                    | Yes          | 20                    | 4.0                   | 4971.60       |
      | IMLB    | 2025-12-22  |                                | 50                             | 100           | 1                         |                        |                |                      | No           | 20                    | 4.0                   | 851.00        |
      | IDAS1   | 2025-12-22  |                                | 50                             | 100           |                           |                        |                |                      | Yes          | 20                    | 4.0                   | 502.80        |
      | IDAS2   | 2025-12-22  |                                | 50                             | 100           |                           |                        |                |                      | No           | 20                    | 4.0                   | 671.00        |

    @dec2025_police_other_hourly_rate
    Examples: Police Other Hourly Rate
      | feeCode | startDate   | uniqueFileNumber | netProfitCosts | netTravelCosts | netWaitingCosts | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal |
      | INVA    | 2016-04-01  | 221225/001       | 200            | 50             | 60              | Yes          | 20                    | 10.5                  | 396.00|
      | INVE    | 2016-04-01  | 221225/001       | 400            | 200            | 100             | No           | 20                    | 15.5                  | 724.00|
      | INVH    | 2016-04-01  | 221225/001       | 400            | 200            | 100             | Yes          | 20                    | 15.5                  | 864.00|
      | INVK    | 2016-04-01  | 221225/001       | 400            | 200            | 100             | No           | 20                    | 10.5                  | 724.00|
      | INVL    | 2016-04-01  | 221225/001       | 400            | 200            | 100             |Yes           | 20                    | 10.5                  | 864.00|
      | INVM    | 2021-06-07  | 221225/001       | 20             | 50             | 60              |No            | 20                    | 15.5                  | 154.00|

    @dec2025_police_other_fixed_fee
    Examples: Police Other Fixed Fee
      | feeCode | startDate  | uniqueFileNumber | netProfitCosts | netTravelCosts | netWaitingCosts | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal |
      | INVB1   | 2016-04-01 | 221225/001       | 45             |                |                 | Yes          | 20                    | 10.5                  | 39.60         |
      | INVB2   | 2016-04-01 | 221225/001       | 10             |                |                 | No           | 20                    | 15.5                  | 31.74         |

    @dec2025_police_station_work
    Examples: Police Station Work
      | feeCode  | startDate  | uniqueFileNumber  | policeStationId | policeStationSchemeId  | netDisbursementAmount | disbursementVatAmount | vatIndicator | numberOfMediationSessions | boltOnAdjournedHearing | expectedTotal |
      | INVC     | 2016-04-01 | 221225/001        | NE001           | 1001                   | 20                    | 10.50                 | true         | 0                         | 0                      | 408.00|
      | INVC     | 2016-04-01 | 221225/002        | NE003           | 1001                   | 20                    | 10.50                 | false        | 0                         | 0                      | 344.00|
      | INVC     | 2022-09-30 | 221225/003        | NE016           | 1004                   | 20                    | 15.50                 | true         | 0                         | 0                      | 408.00|
      | INVC     | 2022-09-30 | 221225/004        | NE041           | 1010                   | 20                    | 15.50                 | false        | 0                         | 0                      | 344.00|
      | INVC     | 2024-12-06 | 221225/005        | RD052           | 1141                   | 20                    | 15.50                 | true         | 0                         | 0                      | 408.00|
      | INVC     | 2024-12-06 | 221225/006        | RD091           | 1142                   | 20                    | 15.50                 | false        | 0                         | 0                      | 344.00|

    @dec2025_mags_court_designated_and_undesignated
    Examples: Magistrates Court Designated and Undesignated
      | feeCode | startDate   | representationOrderDate | netTravelCosts | netWaitingCosts | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal |
      | PROJ5   | 2016-04-01  | 2025-12-22              |                |                 | Yes          | 20                    | 10.5                  | 401.54|
      | PROJ6   | 2016-04-01  | 2025-12-22              |                |                 | Yes          | 20                    | 15.5                  | 330.94|
      | PROJ7   | 2016-04-01  | 2025-12-22              |                |                 | Yes          | 20                    | 10.5                  | 740.21|
      | PROJ8   | 2016-04-01  | 2025-12-22              |                |                 | No           | 20                    | 10.5                  | 575.09|
      | PROK1   | 2016-04-01  | 2025-12-22              |                |                 | Yes          | 20                    | 15.5                  | 401.54|
      | PROK2   | 2016-04-01  | 2025-12-22              |                |                 | No           | 20                    | 15.5                  | 279.78|
      | PROK3   | 2022-09-30  | 2025-12-22              |                |                 | Yes          | 20                    | 10.5                  | 548.22|
      | PROL1   | 2022-09-30  | 2025-12-22              |                |                 | No           | 20                    | 10.5                  | 620.84|
      | PROL2   | 2016-04-01  | 2025-12-22              |                |                 | Yes          | 20                    | 15.5                  | 685.31|
      | PROL3   | 2022-09-30  | 2025-12-22              |                |                 | No           | 20                    | 15.5                  | 939.04|
      | PROE1   | 2016-04-01  | 2025-12-22              | 100            | 50              | Yes          | 20                    | 10.5                  | 499.52|
      | PROE2   | 2016-04-01  | 2025-12-22              | 100            | 50              | Yes          | 20                    | 15.5                  | 444.25|
      | PROE3   | 2016-04-01  | 2025-12-22              | 100            | 50              | Yes          | 20                    | 10.5                  | 628.21|
      | PROF1   | 2022-09-30  | 2025-12-22              | 100            | 50              | No           | 20                    | 10.5                  | 695.57|
      | PROF2   | 2016-04-01  | 2025-12-22              | 100            | 50              | Yes          | 20                    | 15.5                  | 781.91|
      | PROF3   | 2016-04-01  | 2025-12-22              | 100            | 50              | No           | 20                    | 15.5                  | 984.79|
      | PROJ1   | 2016-04-01  | 2025-12-22              | 100            | 50              | Yes          | 20                    | 10.5                  | 499.52|
      | PROJ2   | 2016-04-01  | 2025-12-22              | 100            | 50              | No           | 20                    | 10.5                  | 374.21|
      | PROJ3   | 2022-09-30  | 2025-12-22              | 100            | 50              | Yes          | 20                    | 15.5                  | 829.88|
      | PROJ4   | 2022-09-30  | 2025-12-22              | 100            | 50              | No           | 20                    | 15.5                  | 655.59|

    @dec2025_youth_court_designated_and_undesignated
    Examples: Youth Court Designated and Undesignated
      | feeCode | startDate   | representationOrderDate | netTravelCosts | netWaitingCosts | vatIndicator | netDisbursementAmount | disbursementVatAmount | expectedTotal |
      | YOUK1   | 2024-12-06  | 2025-12-22              |                |                 | Yes          | 20                    | 10.5                  | 1191.68|
      | YOUK2   | 2024-12-06  | 2025-12-22              |                |                 | No           | 20                    | 10.5                  | 279.78|
      | YOUK3   | 2024-12-06  | 2025-12-22              |                |                 | Yes          | 20                    | 15.5                  | 1338.36|
      | YOUK4   | 2024-12-06  | 2025-12-22              |                |                 | No           | 20                    | 15.5                  | 460.85|
      | YOUL1   | 2024-12-06  | 2025-12-22              |                |                 | Yes          | 20                    | 10.5                  | 1530.35|
      | YOUL2   | 2024-12-06  | 2025-12-22              |                |                 | No           | 20                    | 10.5                  | 575.09|
      | YOUL3   | 2024-12-06  | 2025-12-22              |                |                 | Yes          | 20                    | 15.5                  | 1912.18|
      | YOUL4   | 2024-12-06  | 2025-12-22              |                |                 | No           | 20                    | 15.5                  | 939.04|
      | YOUY1   | 2024-12-06  | 2025-12-22              |                |                 | Yes          | 20                    | 10.5                  | 1191.68|
      | YOUY2   | 2024-12-06  | 2025-12-22              |                |                 | No           | 20                    | 10.5                  | 279.78|
      | YOUY3   | 2024-12-06  | 2025-12-22              |                |                 | Yes          | 20                    | 15.5                  | 1530.35|
      | YOUY4   | 2024-12-06  | 2025-12-22              |                |                 | No           | 20                    | 15.5                  | 575.09|
      | YOUE1   | 2024-12-06  | 2025-12-22              | 100            | 50              | Yes          | 20                    | 10.5                  | 1289.66|
      | YOUE2   | 2024-12-06  | 2025-12-22              | 100            | 50              | No           | 20                    | 10.5                  | 374.21|
      | YOUE3   | 2024-12-06  | 2025-12-22              | 100            | 50              | Yes          | 20                    | 15.5                  | 1418.35|
      | YOUE4   | 2024-12-06  | 2025-12-22              | 100            | 50              | No           | 20                    | 15.5                  | 527.51|
      | YOUF1   | 2024-12-06  | 2025-12-22              | 100            | 50              | Yes          | 20                    | 10.5                  | 1620.01|
      | YOUF2   | 2024-12-06  | 2025-12-22              | 100            | 50              | No           | 20                    | 10.5                  | 655.59|
      | YOUF3   | 2024-12-06  | 2025-12-22              | 100            | 50              | Yes          | 20                    | 15.5                  | 1967.09|
      | YOUF4   | 2024-12-06  | 2025-12-22              | 100            | 50              | No           | 20                    | 15.5                  | 984.79|
      | YOUX1   | 2024-12-06  | 2025-12-22              | 100            | 50              | Yes          | 20                    | 10.5                  | 1289.66|
      | YOUX2   | 2024-12-06  | 2025-12-22              | 100            | 50              | No           | 20                    | 10.5                  | 374.21|
      | YOUX3   | 2024-12-06  | 2025-12-22              | 100            | 50              | Yes          | 20                    | 15.5                  | 1620.01|
      | YOUX4   | 2024-12-06  | 2025-12-22              | 100            | 50              | No           | 20                    | 15.5                  | 655.59|
