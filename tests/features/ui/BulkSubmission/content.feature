@bulkSubmission @content
Feature: Content check for the UI matching UX designs

  Scenario: Landing page content matches design
    Given I am on the bulk submission landing page
    Then the page content matches "landing_page.html"

  Scenario: Upload page content matches design
    Given I am on the bulk import page
    Then the page content matches "upload.html"

  Scenario: Import in progress page content matches design
    Given I am on the bulk import page
    And I generate "Legal help" "csv" file with "1" outcomes
    When I upload the generated file and wait for import in progress
    Then the page content matches "upload_check.html"

  Scenario: Search results table layout matches design
    Given I am on the Search page
    And I ensure there is a "VALIDATION_SUCCEEDED" submission for "LEGAL HELP"
    When I search using the most recent submission reference
    Then the search results table matches the expected layout

  Scenario: Search page content matches design
    Given I am on the Search page
    Then the page content matches "search.html"
