@bulkSubmission @content @stable
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

  Scenario: Search results table layout matches design
    Given I am on the Search page
    And I ensure there is a "VALIDATION_SUCCEEDED" submission for "LEGAL HELP"
    When I search using the most recent submission reference
    Then the search results table matches the expected layout

  Scenario Outline: Claim details show fee calculation headings for <AreaOfLaw>
    Given I am on the bulk import page
    When I generate "<AreaOfLaw>" "csv" file with "1" outcomes
    And I upload the generated file
    And I should see the submission summary for "<AreaOfLaw>"
    And I open the first claim in the submission
    Then I should see the following fee calculation headings:
      | Heading                           |
      | Fixed Fee                         |
      | Net Profit Cost                   |
      | Net Disbursements                 |
      | Disbursement VAT                  |
      | Net Cost of Counsel               |
      | Travel and Waiting Costs          |
      | Adjourned Hearing Fee             |
      | JR / Form Filling                 |
      | Detention Travel & Waiting Costs  |
      | CMRH Telephone                    |
      | CMRH Oral                         |
      | Home Office Interview             |
      | Substantive Hearing               |
      | VAT                               |
    Examples:
      | AreaOfLaw   |
      | Mediation   |
      | Legal help  |
      | Crime lower |

  Scenario: Search page content matches design
    Given I am on the Search page
    Then the page content matches "search.html"
