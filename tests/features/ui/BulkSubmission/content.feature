@content @new @stable
Feature: Content check for the UI matching UX designs

  Background:
    Given I start from a clean logged-in state

  Scenario: Landing page content matches design
    Given I am on the bulk submission landing page
    Then the page content matches "landing_page.html"

  Scenario: Upload page content matches design
    Given I am on the bulk import page
    Then the page content matches "upload.html"

  Scenario: Import in progress page content matches design
    Given I am on the bulk import page
    And I generate "Legal help" "csv" file with "1" outcomes
    When I upload the generated file and wait for import in progress screen
    Then the page content matches "upload_check.html"

  Scenario: Claim details show fee calculation headings for "Legal help"
    Given I am on the bulk import page
    When I generate "Legal help" "csv" file with "1" outcomes
    And I upload the generated file
    And I should see the submission summary for "Legal help"
    And I open the first claim in the submission
    Then I should see the following fee calculation headings:
      | Heading                          |
      | Fixed Fee                        |
      | Profit Cost(ex VAT)              |
      | Disbursements(ex VAT)            |
      | Disbursement VAT                 |
      | Counsel's cost(ex VAT)           |
      | Travel & Waiting Costs           |
      | JR / Form Filling                |
      | Adjourned Hearing Fee            |
      | Detention Travel & Waiting Costs |
      | CMRH Telephone                   |
      | CMRH Oral                        |
      | Home Office Interview            |
      | Substantive Hearing              |
      | VAT                              |


  Scenario: Claim details show fee calculation headings for "Crime lower"
    Given I am on the bulk import page
    When I generate "Crime lower" "csv" file with "1" outcomes
    And I upload the generated file
    And I should see the submission summary for "Crime lower"
    And I open the first claim in the submission
    Then I should see the following fee calculation headings:
      | Heading                          |
      | Fixed Fee                        |
      | Profit Cost(ex VAT)              |
      | Disbursements(ex VAT)            |
      | Disbursement VAT                 |
      | Counsel's cost(ex VAT)           |
      | Travel Costs                     |
      | Waiting Costs                    |
      | JR / Form Filling                |
      | Adjourned Hearing Fee            |
      | Detention Travel & Waiting Costs |
      | CMRH Telephone                   |
      | CMRH Oral                        |
      | Home Office Interview            |
      | Substantive Hearing              |
      | VAT                              |

  Scenario: Claim details show fee calculation headings for "Mediation"
    Given I am on the bulk import page
    When I generate "Mediation" "csv" file with "1" outcomes
    And I upload the generated file
    And I should see the submission summary for "Mediation"
    And I open the first claim in the submission
    Then I should see the following fee calculation headings:
      | Heading                          |
      | Fixed Fee                        |
      | Net Profit Cost                  |
      | Net Disbursements                |
      | Disbursement VAT                 |
      | Net Cost of Counsel              |
      | Adjourned Hearing Fee            |
      | JR / Form Filling                |
      | Detention Travel & Waiting Costs |
      | CMRH Telephone                   |
      | CMRH Oral                        |
      | Home Office Interview            |
      | Substantive Hearing              |
      | VAT                              |

  Scenario: Search page content matches design
    Given I am on the Search page
    Then the search page content matches "search.html"
