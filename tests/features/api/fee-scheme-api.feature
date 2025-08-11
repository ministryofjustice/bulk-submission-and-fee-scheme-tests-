Feature: Fee Scheme API Tests

  @api
  Scenario Outline: Fetch a known category-of-law code for a given fee code
    Given I have an initialized API client
    When I GET "/api/v1/category-of-law/<feeCode>"
    Then the response status should be 200
    And the JSON path "categoryOfLawCode" should equal "<categoryCode>"

    Examples:
      | feeCode   | categoryCode |
      | CAPA      | AAP          |
      # | CLIN      | MED          |
      # | COM       | COM          |
      # | DEBT      | DEB          |
      # | DISC      | DISC         |
      # | EDUFIN    | EDU          |
      # | ELA       | ELA          |
      # | FPB1      | MAT          |
      # | FPB8A     | MAT          |
      # | FPV12     | MAT          |
      # | HOUS      | HOU          |
      # | LIMMLH1   | IMMOT        |
      # | LIMMCLR1  | IMMOT        |
      # | IMMDIS    | IMMOT        |
      # | LASYLH1   | IMMAS        |
      # | LASYCLR1  | IMMAS        |
      # | LASYDDAS1 | IMMAS        |
      # | LASYDAC   | IMMAS        |
      # | ASYDIS    | IMMAS        |
      # | MHL01     | MHE          |
      # | MHLDIS    | MHE          |
      # | PUB       | PUB          |
      # | MISCGEN   | MSC          |
      # | MISCCON   | MSC          |
      # | MISCPI    | MSC          |
      # | MISCASBI  | MSC          |
      # | MISCEMP   | MSC          |
      # | WFB1      | WB           |
      # | MAM1      | MEDI         |
      # | MED1      | MEDI         |
      # | APPA      | APPEALS      |
      # | APPB      | APPEALS      |
      # | APPC      | APPEALS      |
      # | PRIA      | PRISON       |
      # | PRIB1     | PRISON       |
      # | PRIC1     | PRISON       |
      # | ABC123    | ASY          |
